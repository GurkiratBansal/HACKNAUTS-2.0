// FRESH:FILE  src/serializers/index.js
// FRESH:AREA  API

// FRESH:API  Function: serializeUser.
export function serializeUser(user) {
  return {
    id: user.id, name: user.name, email: user.email, phone: user.phone,
    role: user.role, orgName: user.organizationName, city: user.city,
    state: user.state, ngoId: user.role === 'ngo' ? user.id : undefined,
    location: user.location ? { lat: user.location[1], lng: user.location[0] } : null,
    verified: user.verificationStatus === 'verified',
  }
}

// FRESH:API  Function: serializeDonation.
export function serializeDonation(row, { revealContact = false } = {}) {
  return {
    id: row.id, donorId: row.donorId, donorName: row.donorName || row.donor?.organizationName || row.donor?.name,
    donorType: row.donorType || row.donor?.orgType, foodName: row.foodName, category: row.category,
    diet: row.vegType, quantity: row.quantityServings, cookedAt: row.cookedAt, storage: row.storageCondition,
    deadline: row.pickupDeadline, address: row.addressLine, location: row.location ? { lat: row.location[1], lng: row.location[0] } : null,
    photo: row.imageUrl || '', contactPhone: revealContact ? row.contactPhone : undefined,
    status: row.status, acceptedBy: row.acceptedBy, acceptedAt: row.acceptedAt,
    isRelief: row.isRelief, isSample: row.isSample, createdAt: row.createdAt,
    timeline: row.timeline || [], reports: row.reports || [],
  }
}
