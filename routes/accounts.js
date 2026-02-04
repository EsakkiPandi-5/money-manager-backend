const express = require('express');
const router = express.Router();
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Transfer = require('../models/Transfer');

/* =========================
   GET ALL ACCOUNTS
========================= */
router.get('/', async (req, res) => {
  try {
    const accounts = await Account.find().sort({ name: 1 });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   CREATE NEW ACCOUNT
========================= */
router.post('/', async (req, res) => {
  try {
    const account = new Account(req.body);
    await account.save();
    res.status(201).json(account);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* =========================
   GET ALL TRANSFERS
   ⚠️ MUST BE BEFORE :name ROUTES
========================= */
router.get('/transfers/all', async (req, res) => {
  try {
    const transfers = await Transfer.find().sort({ date: -1 });
    res.json(transfers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   TRANSFER BETWEEN ACCOUNTS
========================= */
router.post('/transfer', async (req, res) => {
  try {
    const { fromAccount, toAccount, amount, description } = req.body;

    if (!fromAccount || !toAccount || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid transfer data' });
    }

    if (fromAccount === toAccount) {
      return res.status(400).json({ error: 'Cannot transfer to the same account' });
    }

    const from = await Account.findOne({ name: fromAccount });
    const to = await Account.findOne({ name: toAccount });

    if (!from || !to) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (from.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    from.balance -= amount;
    to.balance += amount;

    await from.save();
    await to.save();

    const transfer = new Transfer({
      fromAccount,
      toAccount,
      amount,
      description: description || `Transfer from ${fromAccount} to ${toAccount}`,
    });

    await transfer.save();

    res.status(201).json(transfer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* =========================
   GET ACCOUNT TRANSACTIONS
   ⚠️ MUST BE LAST
========================= */
router.get('/:name/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find({
      account: req.params.name,
    }).sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
