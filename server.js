const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const fsPromises = require('fs/promises');
const { fal } = require('@fal-ai/client');

// Set FAL API key
process.env.FAL_KEY = '03c9ee28-16c8-4298-ada8-a6cba2de94be:112a61e5bab77062736544e5ef9b2141';

const app = express();
const PORT = process.env.PORT || 3000;

// History file path
const HISTORY_FILE = 'history.json';

// Helper functions for history management
async function loadHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const data = await fsPromises.readFile(HISTORY_FILE, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading history:', error);
    return [];
  }
}

async function saveHistory(history) {
  try {
    await fsPromises.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('Error saving history:', error);
  }
}

async function addToHistory(entry) {
  try {
    const history = await loadHistory();
    // Add new entry at the beginning
    history.unshift(entry);
    // Keep only the last 50 entries to prevent file from getting too large
    if (history.length > 50) {
      history.splice(50);
    }
    await saveHistory(history);
  } catch (error) {
    console.error('Error adding to history:', error);
  }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Test endpoint to check if server is working
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// Get history endpoint
app.get('/api/history', async (req, res) => {
  try {
    const history = await loadHistory();
    res.json({ success: true, history });
  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({ error: 'Failed to load history' });
  }
});

// Delete history item endpoint
app.delete('/api/history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const history = await loadHistory();
    const itemIndex = history.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'History item not found' });
    }
    
    const item = history[itemIndex];
    
    // Remove the item from history
    history.splice(itemIndex, 1);
    await saveHistory(history);
    
    // Optionally delete the associated files
    try {
      const originalPath = path.join(__dirname, 'uploads', item.originalImage);
      const generatedPath = path.join(__dirname, 'uploads', item.generatedImage);
      
      if (fs.existsSync(originalPath)) {
        fs.unlinkSync(originalPath);
      }
      if (fs.existsSync(generatedPath)) {
        fs.unlinkSync(generatedPath);
      }
    } catch (fileError) {
      console.error('Error deleting files:', fileError);
      // Continue even if file deletion fails
    }
    
    res.json({ success: true, message: 'History item deleted' });
  } catch (error) {
    console.error('Error deleting history item:', error);
    res.status(500).json({ error: 'Failed to delete history item' });
  }
});

// Upload image and process with AI
app.post('/api/transform-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'No prompt provided' });
    }

    // Read the uploaded file and convert to base64
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString('base64');
    
    // Convert base64 to data URL for FAL AI
    const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;

    try {
      // Call FAL AI Flux Pro model
      const result = await fal.subscribe("fal-ai/flux-pro/kontext", {
        input: {
          prompt: prompt,
          image_url: dataUrl
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            update.logs.map((log) => log.message).forEach(console.log);
          }
        },
      });

      console.log('FAL AI Response:', result.data);
      console.log('Request ID:', result.requestId);
      console.log('Generated image URL:', result.data.images[0].url);

      // Download the generated image from the URL
      const imageResponse = await axios.get(result.data.images[0].url, {
        responseType: 'arraybuffer',
        timeout: 30000 // 30 second timeout
      });
      
      console.log('Image download successful, size:', imageResponse.data.length, 'bytes');

      // Get the content type to determine the correct file extension
      const contentType = imageResponse.headers['content-type'] || 'image/jpeg';
      const extension = contentType.includes('png') ? 'png' : 
                       contentType.includes('webp') ? 'webp' : 'jpg';
      
      // Save the generated image with correct extension
      const generatedImagePath = `generated-${Date.now()}.${extension}`;
      const fullPath = `uploads/${generatedImagePath}`;
      fs.writeFileSync(fullPath, imageResponse.data);
      
      console.log('Saved generated image to:', fullPath);

      // Save to history
      const historyEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        originalImage: req.file.filename,
        generatedImage: generatedImagePath,
        prompt: prompt,
        requestId: result.requestId
      };
      
      await addToHistory(historyEntry);

      res.json({
        success: true,
        originalImage: req.file.filename,
        generatedImage: generatedImagePath,
        prompt: prompt,
        requestId: result.requestId
      });

    } catch (error) {
      console.error('FAL AI Error:', error);
      res.status(500).json({ 
        error: 'Failed to process image with AI',
        details: error.message 
      });
    }

  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

// Serve uploaded images
app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'uploads', filename);
  
  console.log('Requesting image:', filename);
  console.log('File path:', filepath);
  console.log('File exists:', fs.existsSync(filepath));
  
  if (fs.existsSync(filepath)) {
    // Set proper content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'image/jpeg'; // default
    
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.gif') contentType = 'image/gif';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(filepath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }
  res.status(500).json({ error: error.message });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('FAL AI Flux Pro integration is active!');
  console.log('Upload an image and provide a prompt to transform it.');
}); 