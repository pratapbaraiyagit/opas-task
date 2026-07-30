async function run() {
  const loginRes = await fetch('http://127.0.0.1:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@opas.com', password: 'password123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.accessToken;
  
  const wsRes = await fetch('http://127.0.0.1:5000/api/workspaces', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const wsData = await wsRes.json();
  const workspaceId = wsData.data[0].id;
  
  // 3. Create a unique board
  const uniqueTitle = 'SearchableBoard-' + Date.now();
  await fetch(`http://127.0.0.1:5000/api/workspaces/${workspaceId}/boards`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify({ title: uniqueTitle })
  });
  
  // 4. Search for it
  const searchRes = await fetch(`http://127.0.0.1:5000/api/workspaces/${workspaceId}/boards?search=SearchableBoard`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const searchData = await searchRes.json();
  
  const boards = searchData.data;
  if (!boards.some(b => b.title === uniqueTitle)) throw new Error('Board not found in search results');
  
  // 5. Search for something non-existent
  const noRes = await fetch(`http://127.0.0.1:5000/api/workspaces/${workspaceId}/boards?search=NonExistent123`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const noData = await noRes.json();
  if (noData.data.length !== 0) throw new Error('Should return empty results');
  
  console.log('Search test passed successfully!');
}
run();
