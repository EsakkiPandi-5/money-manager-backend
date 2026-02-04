const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  division: {
    type: String,
    required: true,
    enum: ['Office', 'Personal']
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  account: {
    type: String,
    default: 'Main Account'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
transactionSchema.index({ date: 1, type: 1 });
transactionSchema.index({ category: 1, division: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);

