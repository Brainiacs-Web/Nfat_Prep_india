const mongoose = require('mongoose');

const bundleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Bundle name is required']
  },
  testCount: {
    type: Number,
    required: [true, 'Number of tests is required'],
    min: [1, 'Must have at least one test']
  },
  price: {
    type: Number,
    required: [true, 'Bundle price is required'],
    min: [0, 'Price cannot be negative']
  }
}, { _id: false });

const batchSchema = new mongoose.Schema({
  courseId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  name:      { type: String, required: true },
  type:      { 
    type: String,
    enum: ['mentorship', 'test_series', 'achievers', 'foundation'],
    required: true
  },
  price:     { type: Number, required: function() { return this.type !== 'test_series'; } },
  mentorId:  { type: String, required: true }, // e.g., MENTORXXXX
  duration:  { type: Number, required: true }, // in months
  startDate: { type: Date, required: true },
  endDate:   { type: Date, required: true },

  // New: bundles array only meaningful for test_series
  bundles: {
    type: [bundleSchema],
    validate: {
      validator: function(arr) {
        // If test_series, must supply at least one bundle
        if (this.type === 'test_series') {
          return Array.isArray(arr) && arr.length > 0;
        }
        // Otherwise, ignore whatever bundles is
        return true;
      },
      message: 'test_series batches must include at least one bundle'
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);
