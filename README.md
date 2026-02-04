# Money Manager Backend

Backend API for Money Manager Application built with Node.js, Express, and MongoDB.

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string_here
```

3. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Transactions
- `GET /api/transactions` - Get all transactions (with filters)
- `GET /api/transactions/:id` - Get transaction by ID
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction (12-hour restriction)
- `DELETE /api/transactions/:id` - Delete transaction (12-hour restriction)
- `GET /api/transactions/summary/categories` - Get category summary
- `GET /api/transactions/dashboard/stats` - Get dashboard statistics

### Accounts
- `GET /api/accounts` - Get all accounts
- `POST /api/accounts` - Create new account
- `GET /api/accounts/:name/transactions` - Get account transactions
- `POST /api/accounts/transfer` - Transfer between accounts
- `GET /api/accounts/transfers/all` - Get all transfers

## Features

- Income and Expense tracking
- Category and Division filtering
- Date range filtering
- 12-hour edit restriction
- Account management
- Transfer between accounts
- Dashboard statistics (month/week/year)

