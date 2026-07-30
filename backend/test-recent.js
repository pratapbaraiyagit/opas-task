async function run() {
  const loginRes = await fetch('http://127.0.0.1:5001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@opas.com', password: 'password123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.accessToken;

  // Fetch recent boards
  const recentRes = await fetch('http://127.0.0.1:5001/api/boards/recent', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const recentData = await recentRes.json();
  
  if (recentRes.ok && Array.isArray(recentData.data)) {
    console.log('Recent boards returned successfully:', recentData.data.length);
  } else {
    console.error('Failed to get recent boards:', recentData);
    process.exit(1);
  }
}
run();
