import express from 'express';

export const aiExtractionRouter = express.Router();

/**
 * Deterministic rule-based extraction engine with support for English, Hindi, and Punjabi keywords.
 */
function extractFoodFromTranscript(transcript, referenceTime = new Date()) {
  const lower = transcript.toLowerCase();
  const missingFields = [];
  const uncertainFields = [];
  const followUpQuestions = [];

  // 1. Diet Detection
  const nonVegKeywords = ['chicken', 'mutton', 'fish', 'egg', 'meat', 'murgh', 'gosht', 'machli', 'anda', 'kebab'];
  const jainKeywords = ['jain', 'no onion', 'no garlic', 'satvik'];
  const veganKeywords = ['vegan', 'plant-based', 'dairy-free'];

  let diet = 'veg';
  let backendFoodType = 'VEG';

  if (nonVegKeywords.some((w) => lower.includes(w))) {
    diet = 'non-veg';
    backendFoodType = 'NON_VEG';
  } else if (jainKeywords.some((w) => lower.includes(w))) {
    diet = 'jain';
    backendFoodType = 'JAIN';
  } else if (veganKeywords.some((w) => lower.includes(w))) {
    diet = 'vegan';
    backendFoodType = 'VEGAN';
  }

  // 2. Quantity Extraction
  let quantity = 10;
  let quantityUnit = 'PLATES';
  const quantityRegex = /(\d+)\s*(plates?|kg|kilos?|servings?|boxes?|liters?|packets?|meals?|thali|plates|kilo|packet)?/i;
  const match = transcript.match(quantityRegex);

  if (match && match[1]) {
    quantity = parseInt(match[1], 10);
    const unitWord = match[2]?.toLowerCase() || '';
    if (unitWord.includes('kg') || unitWord.includes('kilo')) quantityUnit = 'KG';
    else if (unitWord.includes('box')) quantityUnit = 'BOXES';
    else if (unitWord.includes('liter')) quantityUnit = 'LITERS';
    else if (unitWord.includes('packet')) quantityUnit = 'PACKETS';
    else if (unitWord.includes('serving')) quantityUnit = 'SERVINGS';
    else if (unitWord.includes('meal')) quantityUnit = 'MEALS';
    else quantityUnit = 'PLATES';
  } else {
    missingFields.push('quantity');
    followUpQuestions.push('How many servings or kilograms of food are available for pickup?');
    uncertainFields.push({
      field: 'quantity',
      value: 10,
      reason: 'No exact count detected; defaulted to 10 plates for review.',
    });
  }

  // 3. Storage Detection
  let storage = 'room';
  let backendStorageCondition = 'ROOM_TEMPERATURE';

  if (lower.includes('garam') || lower.includes('hot') || lower.includes('freshly cooked') || lower.includes('warm')) {
    storage = 'hot';
    backendStorageCondition = 'HOT_FRESHLY_COOKED';
  } else if (lower.includes('fridge') || lower.includes('refrigerat') || lower.includes('thanda') || lower.includes('cold')) {
    storage = 'refrigerated';
    backendStorageCondition = 'REFRIGERATED';
  } else if (lower.includes('frozen') || lower.includes('deep freeze')) {
    storage = 'frozen';
    backendStorageCondition = 'FROZEN';
  }

  // 4. Food Name / Title Extraction
  let foodName = 'Surplus Cooked Meals';
  const foodKeywords = [
    'dal makhani', 'biryani', 'paneer', 'roti', 'sabzi', 'rice', 'jeera rice', 'curry',
    'chawal', 'rajma', 'chole', 'pulao', 'naan', 'pasta', 'sandwiches', 'samosa', 'paratha',
    'puri', 'halwa', 'kheer', 'noodles', 'bread', 'sweets'
  ];
  const foundKeywords = foodKeywords.filter((k) => lower.includes(k));
  if (foundKeywords.length > 0) {
    foodName = foundKeywords
      .map((s) => s.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))
      .join(' & ');
  } else {
    uncertainFields.push({
      field: 'foodName',
      value: foodName,
      reason: 'Food title inferred from context; please verify exact dish name.',
    });
  }

  // 5. Preparation & Expiry Datetimes
  let cookedAt = undefined;
  let expiresAt = undefined;

  const hoursAgoMatch = lower.match(/(\d+)\s*(hours?|hr|ghante|ghanta)\s*(ago|pehle)/i);
  if (hoursAgoMatch && hoursAgoMatch[1]) {
    const hrs = parseInt(hoursAgoMatch[1], 10);
    cookedAt = new Date(referenceTime.getTime() - hrs * 3600000).toISOString();
  } else if (lower.includes('just cooked') || lower.includes('freshly cooked') || lower.includes('freshly prepared') || lower.includes('abhi banaya')) {
    cookedAt = new Date(referenceTime.getTime() - 30 * 60000).toISOString();
  } else {
    missingFields.push('cookedAt');
    followUpQuestions.push('When was this food prepared or packed?');
  }

  // Check for "by X PM / AM" or "baje tak"
  const timeMatch = lower.match(/(by|before|till|consume by|tak|pehle)\s*(\d{1,2})\s*(am|pm|baje)?/i);
  if (timeMatch && timeMatch[2]) {
    let hour = parseInt(timeMatch[2], 10);
    const meridiem = timeMatch[3]?.toLowerCase();
    if ((meridiem === 'pm' || lower.includes('evening') || lower.includes('shaam')) && hour < 12) {
      hour += 12;
    }
    const expDate = new Date(referenceTime);
    expDate.setHours(hour, 0, 0, 0);
    if (expDate.getTime() > referenceTime.getTime()) {
      expiresAt = expDate.toISOString();
    }
  }

  if (!expiresAt) {
    missingFields.push('expiresAt');
    followUpQuestions.push('By what time should this food be picked up before it spoils?');
  }

  let category = 'cooked';
  if (lower.includes('bakery') || lower.includes('cake') || lower.includes('bread') || lower.includes('pastry')) category = 'bakery';
  else if (lower.includes('snack') || lower.includes('samosa') || lower.includes('pakora')) category = 'snacks';
  else if (lower.includes('raw') || lower.includes('vegetable') || lower.includes('fruits')) category = 'raw';

  return {
    foodName,
    description: `Transcribed from voice: "${transcript}"`,
    category,
    diet,
    backendFoodType,
    quantity,
    quantityUnit,
    servesCount: quantityUnit === 'PLATES' || quantityUnit === 'SERVINGS' ? quantity : quantity * 2,
    cookedAt,
    expiresAt,
    storage,
    backendStorageCondition,
    storageInstructions: storage === 'hot' ? 'Keep hot and covered' : storage === 'refrigerated' ? 'Keep chilled at 4°C' : 'Store in a cool dry place',
    allergens: diet === 'non-veg' ? ['Poultry/Meat'] : [],
    confidenceScore: 0.92,
    missingFields,
    uncertainFields,
    followUpQuestions,
  };
}

/**
 * POST /ai-extraction/food
 */
aiExtractionRouter.post('/food', (req, res) => {
  try {
    const { transcript, referenceTime } = req.body;
    if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Speech transcript is required and must be at least 3 characters',
      });
    }

    const refDate = referenceTime ? new Date(referenceTime) : new Date();
    const result = extractFoodFromTranscript(transcript, refDate);

    return res.json({
      success: true,
      statusCode: 200,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message,
    });
  }
});
