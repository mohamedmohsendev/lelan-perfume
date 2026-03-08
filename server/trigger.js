fetch("http://localhost:3001/api/admin/compress-all")
    .then(r => r.json())
    .then(console.log)
    .catch(console.error);
