const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// Get all transactions with filters
router.get('/', async (req, res) => {
  try {
    const { 
      type, 
      division, 
      category, 
      startDate, 
      endDate,
      account 
    } = req.query;

    const filter = {};

    if (type) filter.type = type;
    if (division) filter.division = division;
    if (category) filter.category = category;
    if (account) filter.account = account;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .limit(1000);

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new transaction
router.post('/', async (req, res) => {
  try {
    const transaction = new Transaction(req.body);
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update transaction (with 12-hour restriction)
router.put('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check if 12 hours have passed
    const now = new Date();
    const createdAt = new Date(transaction.createdAt);
    const hoursDiff = (now - createdAt) / (1000 * 60 * 60);

    if (hoursDiff > 12) {
      return res.status(403).json({ 
        error: 'Cannot edit transaction after 12 hours',
        hoursPassed: hoursDiff.toFixed(2)
      });
    }

    Object.assign(transaction, req.body);
    await transaction.save();
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete transaction
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check if 12 hours have passed
    const now = new Date();
    const createdAt = new Date(transaction.createdAt);
    const hoursDiff = (now - createdAt) / (1000 * 60 * 60);

    if (hoursDiff > 12) {
      return res.status(403).json({ 
        error: 'Cannot delete transaction after 12 hours',
        hoursPassed: hoursDiff.toFixed(2)
      });
    }

    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get summary by category
router.get('/summary/categories', async (req, res) => {
  try {
    const { type, division, startDate, endDate } = req.query;
    
    const matchFilter = {};
    if (type) matchFilter.type = type;
    if (division) matchFilter.division = division;
    if (startDate || endDate) {
      matchFilter.date = {};
      if (startDate) matchFilter.date.$gte = new Date(startDate);
      if (endDate) matchFilter.date.$lte = new Date(endDate);
    }

    const summary = await Transaction.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          type: { $first: '$type' },
          division: { $first: '$division' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard data
router.get('/dashboard/stats', async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    
    let dateFilter = {};
    
    if (period === 'month') {
      const now = new Date();
      dateFilter = {
        date: {
          $gte: new Date(now.getFullYear(), now.getMonth(), 1),
          $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0)
        }
      };
    } else if (period === 'week') {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      dateFilter = {
        date: {
          $gte: weekStart,
          $lte: weekEnd
        }
      };
    } else if (period === 'year') {
      const now = new Date();
      dateFilter = {
        date: {
          $gte: new Date(now.getFullYear(), 0, 1),
          $lte: new Date(now.getFullYear(), 11, 31)
        }
      };
    }

    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    const stats = await Transaction.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const income = stats.find(s => s._id === 'income')?.total || 0;
    const expense = stats.find(s => s._id === 'expense')?.total || 0;

    res.json({
      income,
      expense,
      balance: income - expense,
      period: period || 'custom'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

