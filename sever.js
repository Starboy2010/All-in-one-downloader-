require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors'); // Added for CORS support
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Added for proper query param handling
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-heroku-app-name.herokuapp.com'] 
    : '*'
})); // Configure CORS properly
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting middleware (important for Heroku)
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// API Proxy Endpoint
app.get('/api/download', async (req, res) => {
  try {
    const { url, platform, quality } = req.query;
    
    // Validate inputs
    if (!url || !platform) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        required: ['url', 'platform'],
        received: { url, platform, quality }
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const response = await axios.get('https://all-media-downloader.p.rapidapi.com/download', {
      params: { 
        url: url,
        platform: platform,
        quality: quality || 'high'
      },
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'all-media-downloader.p.rapidapi.com'
      },
      timeout: 15000 // 15 second timeout
    });
    
    if (!response.data?.downloadUrl) {
      throw new Error('No download URL in response');
    }

    // Sanitize response before sending to client
    const safeData = {
      title: response.data.title || `${platform} Media`,
      thumbnail: response.data.thumbnail || '',
      duration: response.data.duration || '0:00',
      downloadUrl: response.data.downloadUrl,
      type: quality === 'audio' ? 'audio' : 'video'
    };

    res.json({
      success: true,
      ...safeData
    });
    
  } catch (error) {
    console.error('Proxy Error:', error.message);
    const statusCode = error.response?.status || 500;
    res.status(statusCode).json({ 
      success: false,
      error: 'Download service unavailable',
      details: error.response?.data?.message || error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Serve SPA - must be after API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (process.env.NODE_ENV === 'development') {
    console.log(`RapidAPI Key: ${process.env.RAPIDAPI_KEY ? '***' + process.env.RAPIDAPI_KEY.slice(-4) : 'Not set'}`);
  }
});