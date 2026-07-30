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
  
  const boardsRes = await fetch(`http://127.0.0.1:5000/api/workspaces/${workspaceId}/boards`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const boardsData = await boardsRes.json();
  const boardId = boardsData.data[0].id;

  // Star the board
  await fetch(`http://127.0.0.1:5000/api/boards/${boardId}/star`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  
  // Get starred boards
  const starredRes = await fetch('http://127.0.0.1:5000/api/boards/starred', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const starredData = await starredRes.json();
  
  if (starredData.data.some(b => b.id === boardId)) {
    console.log('Starred Boards feature is fully functional!');
  } else {
    console.error('Board not found in starred list');
    process.exit(1);
  }
}
run();
