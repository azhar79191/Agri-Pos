const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const aiService = require('../services/aiService');
const weatherService = require('../services/weatherService');
const CropAdvisory = require('../models/CropAdvisory');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'crop-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG, and PNG images are allowed'));
    }
  }
});

/**
 * POST /api/ai/crop-advisory
 * Get AI-powered crop advisory
 */
router.post('/crop-advisory', async (req, res) => {
  try {
    const { prompt, crop, issue, symptoms } = req.body;
    
    if (!prompt || !crop || !issue) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: prompt, crop, issue'
      });
    }
    
    const advisory = await aiService.getCropAdvisory(prompt, crop, issue, symptoms);
    
    res.json({
      success: true,
      data: advisory
    });
  } catch (error) {
    console.error('Crop Advisory Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get crop advisory',
      error: error.message
    });
  }
});

/**
 * POST /api/ai/pest-detection
 * Detect pest/disease from uploaded image
 */
router.post('/pest-detection', upload.single('image'), async (req, res) => {
  try {
    const { crop, symptoms } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }
    
    if (!crop) {
      return res.status(400).json({
        success: false,
        message: 'Crop name is required'
      });
    }
    
    // Read image and convert to base64
    const imagePath = req.file.path;
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');
    
    // Detect pest/disease using AI
    const detection = await aiService.detectPestFromImage(imageBase64, crop, symptoms);
    
    // Clean up uploaded file
    fs.unlinkSync(imagePath);
    
    res.json({
      success: true,
      data: detection
    });
  } catch (error) {
    console.error('Pest Detection Error:', error);
    
    // Clean up file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to detect pest from image',
      error: error.message
    });
  }
});

/**
 * POST /api/crop-advisory/save
 * Save advisory to database
 * Requires authentication middleware
 */
router.post('/save', async (req, res) => {
  try {
    // Note: Add your auth middleware here
    // const userId = req.user._id;
    // const shopId = req.user.shop;
    
    const advisoryData = {
      ...req.body,
      // shop: shopId,
      // createdBy: userId,
      aiGenerated: true
    };
    
    const advisory = new CropAdvisory(advisoryData);
    await advisory.save();
    
    res.json({
      success: true,
      data: advisory,
      message: 'Advisory saved successfully'
    });
  } catch (error) {
    console.error('Save Advisory Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save advisory',
      error: error.message
    });
  }
});

/**
 * GET /api/crop-advisory/history/:customerId
 * Get advisory history for a customer
 */
router.get('/history/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    // const shopId = req.user.shop;
    
    const advisories = await CropAdvisory.find({
      // shop: shopId,
      customer: customerId
    })
    .sort({ createdAt: -1 })
    .populate('customer', 'name phone')
    .populate('createdBy', 'name')
    .limit(50);
    
    res.json({
      success: true,
      data: advisories,
      count: advisories.length
    });
  } catch (error) {
    console.error('Get History Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch advisory history',
      error: error.message
    });
  }
});

/**
 * GET /api/crop-advisory/list
 * Get all advisories for shop
 */
router.get('/list', async (req, res) => {
  try {
    // const shopId = req.user.shop;
    const { status, crop, page = 1, limit = 20 } = req.query;
    
    const query = {
      // shop: shopId
    };
    
    if (status) query.status = status;
    if (crop) query.crop = crop;
    
    const advisories = await CropAdvisory.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('customer', 'name phone')
      .populate('createdBy', 'name');
    
    const total = await CropAdvisory.countDocuments(query);
    
    res.json({
      success: true,
      data: advisories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get List Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch advisories',
      error: error.message
    });
  }
});

/**
 * PATCH /api/crop-advisory/:id/status
 * Update advisory status
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const advisory = await CropAdvisory.findById(id);
    
    if (!advisory) {
      return res.status(404).json({
        success: false,
        message: 'Advisory not found'
      });
    }
    
    advisory.status = status;
    if (notes) advisory.notes = notes;
    
    if (status === 'applied') {
      advisory.appliedDate = new Date();
    }
    
    await advisory.save();
    
    res.json({
      success: true,
      data: advisory,
      message: 'Status updated successfully'
    });
  } catch (error) {
    console.error('Update Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
});

/**
 * GET /api/crop-advisory/weather
 * Get weather-based advisory
 */
router.get('/weather', async (req, res) => {
  try {
    const { location } = req.query;
    
    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'Location is required'
      });
    }
    
    const weatherAdvisory = await weatherService.getWeatherAdvisory(location);
    
    res.json({
      success: true,
      data: weatherAdvisory
    });
  } catch (error) {
    console.error('Weather Advisory Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get weather advisory',
      error: error.message
    });
  }
});

/**
 * GET /api/crop-advisory/weather/forecast
 * Get 5-day weather forecast
 */
router.get('/weather/forecast', async (req, res) => {
  try {
    const { location } = req.query;
    
    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'Location is required'
      });
    }
    
    const forecast = await weatherService.getWeatherForecast(location);
    
    res.json({
      success: true,
      data: forecast
    });
  } catch (error) {
    console.error('Weather Forecast Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get weather forecast',
      error: error.message
    });
  }
});

/**
 * GET /api/crop-advisory/statistics
 * Get advisory statistics
 */
router.get('/statistics', async (req, res) => {
  try {
    // const shopId = req.user.shop;
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    const stats = await CropAdvisory.aggregate([
      {
        $match: {
          // shop: mongoose.Types.ObjectId(shopId),
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalAdvisories: { $sum: 1 },
          totalCost: { $sum: '$totalCost' },
          bySeverity: {
            $push: '$severity'
          },
          byCrop: {
            $push: '$crop'
          },
          byStatus: {
            $push: '$status'
          }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: stats[0] || {
        totalAdvisories: 0,
        totalCost: 0,
        bySeverity: [],
        byCrop: [],
        byStatus: []
      }
    });
  } catch (error) {
    console.error('Statistics Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message
    });
  }
});

module.exports = router;
