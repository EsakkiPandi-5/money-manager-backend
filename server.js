const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// CORS FIRST
app.use(cors());
app.options("*", cors());

app.use(express.json());

// DB
connectDB();

// ROUTES (NO AUTH)
app.use("/api/accounts", require("./routes/accounts"));
app.use("/api/transactions", require("./routes/transactions"));

// FORCE CORS ON ALL RESPONSES
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
