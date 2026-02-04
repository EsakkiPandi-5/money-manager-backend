const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

/* =========================
   CORS CONFIG (MUST BE FIRST)
========================= */
app.use(cors({
  origin: "*", // allow all origins (hackathon-safe)
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Allow preflight requests
app.options("*", cors());

/* =========================
   BODY PARSER
========================= */
app.use(express.json());

/* =========================
   DB CONNECTION
========================= */
connectDB();

/* =========================
   ROUTES (NO GLOBAL AUTH)
========================= */
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/accounts', require('./routes/accounts'));

/* =========================
   HEALTH CHECK
========================= */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Money Manager API is running',
  });
});

/* =========================
   SERVER START
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
