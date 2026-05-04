const mongoose = require('mongoose');

const cropAdvisorySchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true,
    index: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    index: true
  },
  crop: {
    type: String,
    required: true,
    trim: true
  },
  issue: {
    type: String,
    required: true,
    trim: true
  },
  diagnosis: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    required: true
  },
  confidence: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  recommendedProducts: [{
    name: {
      type: String,
      required: true
    },
    dosage: String,
    price: Number,
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }
  }],
  alternatives: [String],
  preventionTips: [String],
  fieldSize: {
    type: Number,
    default: 1,
    min: 0.1
  },
  location: {
    type: String,
    trim: true
  },
  totalCost: {
    type: Number,
    default: 0
  },
  image: {
    type: String // URL or path to uploaded image
  },
  applicationMethod: {
    type: String
  },
  safetyInterval: {
    type: String
  },
  urgency: {
    type: String
  },
  symptoms: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'applied', 'completed', 'cancelled'],
    default: 'pending'
  },
  appliedDate: {
    type: Date
  },
  followUpDate: {
    type: Date
  },
  notes: {
    type: String
  },
  weatherConditions: {
    temp: Number,
    humidity: Number,
    description: String
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
cropAdvisorySchema.index({ shop: 1, createdAt: -1 });
cropAdvisorySchema.index({ customer: 1, createdAt: -1 });
cropAdvisorySchema.index({ crop: 1, issue: 1 });
cropAdvisorySchema.index({ status: 1 });

// Virtual for days since creation
cropAdvisorySchema.virtual('daysSinceCreation').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Method to mark as applied
cropAdvisorySchema.methods.markAsApplied = function() {
  this.status = 'applied';
  this.appliedDate = new Date();
  return this.save();
};

// Method to mark as completed
cropAdvisorySchema.methods.markAsCompleted = function() {
  this.status = 'completed';
  return this.save();
};

// Static method to get statistics
cropAdvisorySchema.statics.getStatistics = async function(shopId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        shop: mongoose.Types.ObjectId(shopId),
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalAdvisories: { $sum: 1 },
        totalCost: { $sum: '$totalCost' },
        byCrop: {
          $push: {
            crop: '$crop',
            issue: '$issue',
            severity: '$severity'
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('CropAdvisory', cropAdvisorySchema);
