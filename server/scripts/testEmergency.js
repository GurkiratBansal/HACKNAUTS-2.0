async function main() {
  const API_URL = 'http://localhost:4010';

  // register admin user
  const registerRes = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    }),
  });
  const registerData = await registerRes.json();
  console.log('Register response:', registerData);

  // login admin
  const loginRes = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'password123',
    }),
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('Login successful, token received');

  // simulate emergency alert
  const simulateRes = await fetch(`${API_URL}/api/emergency/simulate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      state: 'Delhi',
      hazardType: 'flood',
      severity: 'high',
      districts: ['North Delhi', 'South Delhi'],
    }),
  });
  const simulateData = await simulateRes.json();
  console.log('Simulated emergency alert created:', simulateData);

  // fetch active alerts
  const alertsRes = await fetch(`${API_URL}/api/emergency/alerts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const alerts = await alertsRes.json();
  console.log('Active emergency alerts:', alerts);
}

main().catch(err => {
  console.error('Error during emergency mode test:', err);
});