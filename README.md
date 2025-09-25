# Income Expense App

A simple ASP.NET Core Web API for managing personal income and expense transactions, similar to MoneyPro app.

## Features

- ✅ Add, edit, and delete income transactions
- ✅ Add, edit, and delete expense transactions
- ✅ Categorize transactions
- ✅ Filter transactions by type, category, and date range
- ✅ View financial summary (total income, expenses, balance)
- ✅ SQLite database (no SQL Server required)
- ✅ RESTful API with Swagger documentation
- ✅ Ready for deployment on Railway.app

## Tech Stack

- **Backend**: ASP.NET Core 8.0 Web API
- **Database**: SQLite with Entity Framework Core
- **Documentation**: Swagger/OpenAPI
- **Deployment**: Ready for Railway.app

## API Endpoints

### Transactions
- `GET /api/transactions` - Get all transactions (with filtering and pagination)
- `GET /api/transactions/{id}` - Get specific transaction
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction

### Summary & Analytics
- `GET /api/transactions/summary` - Get financial summary
- `GET /api/transactions/categories` - Get all categories

### Health Check
- `GET /health` - API health status

## Getting Started

### Prerequisites
- .NET 8.0 SDK
- Visual Studio Code or Visual Studio

### Running Locally

1. **Clone and navigate to the project**:
   ```bash
   git clone https://github.com/farhadalam75/IncomeExpenseApp.git
   cd IncomeExpenseApp/IncomeExpenseApp
   ```

2. **Restore packages**:
   ```bash
   dotnet restore
   ```

3. **Run the application**:
   ```bash
   dotnet run
   ```

4. **Open Swagger UI**:
   Navigate to `https://localhost:5001` or `http://localhost:5000`

### Database

The app uses SQLite and will automatically create the database file (`incomeexpense.db`) on first run. No additional setup required!

## Sample API Usage

### Create an Income Transaction
```bash
curl -X POST "https://localhost:5001/api/transactions" \
-H "Content-Type: application/json" \
-d '{
  "description": "Salary",
  "amount": 5000.00,
  "type": 1,
  "category": "Work",
  "date": "2025-09-25T00:00:00Z",
  "notes": "Monthly salary"
}'
```

### Create an Expense Transaction
```bash
curl -X POST "https://localhost:5001/api/transactions" \
-H "Content-Type: application/json" \
-d '{
  "description": "Groceries",
  "amount": 150.00,
  "type": 2,
  "category": "Food",
  "date": "2025-09-25T00:00:00Z",
  "notes": "Weekly shopping"
}'
```

### Get Financial Summary
```bash
curl -X GET "https://localhost:5001/api/transactions/summary"
```

## Transaction Types

- `1` = Income
- `2` = Expense

## Deployment on Railway.app

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Deploy the app**:
   ```bash
   ./deploy-railway.sh
   ```
   Or manually: `railway up`

The app includes Railway-specific configurations (`railway.toml`, `railway.json`, `nixpacks.toml`) for seamless deployment.

## Detailed Railway Deployment

For comprehensive Railway.app deployment instructions, see [RAILWAY-DEPLOYMENT.md](RAILWAY-DEPLOYMENT.md)

## Project Structure

```
IncomeExpenseApp/
├── Controllers/
│   └── TransactionsController.cs    # API endpoints
├── Data/
│   └── AppDbContext.cs              # Entity Framework context
├── Models/
│   ├── Transaction.cs               # Main transaction model
│   └── DTOs/
│       └── TransactionDtos.cs       # Data transfer objects
├── Program.cs                       # Application startup
├── IncomeExpenseApp.csproj         # Project file
├── Dockerfile                      # Docker configuration
├── railway.toml                    # Railway configuration
├── railway.json                    # Railway deployment settings
└── deploy-railway.sh               # Deployment script
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).