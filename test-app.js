const express = require('express');
const path = require('path');
const fs = require('fs');

// Simple test server to verify image serving
const app = express();
const PORT = 3001;

app.use(express.static('public'));

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Test server is working!', 
    timestamp: new Date().toISOString(),
    uploadsDir: fs.existsSync('uploads') ? 'exists' : 'missing'
  });
});

// Serve uploaded images
app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'uploads', filename);
  
  console.log('Test: Requesting image:', filename);
  console.log('Test: File path:', filepath);
  console.log('Test: File exists:', fs.existsSync(filepath));
  
  if (fs.existsSync(filepath)) {
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'image/jpeg';
    
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.gif') contentType = 'image/gif';
    
    res.setHeader('Content-Type', contentType);
    res.sendFile(filepath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log('This is a test server to verify image serving works correctly.');
}); 