# 🚀 Quick Start Guide

## Local Development

1. **Prerequisites**: .NET 8.0 SDK
2. **Run the app**:
   ```bash
   cd IncomeExpenseApp
   ASPNETCORE_ENVIRONMENT=Development dotnet run
   ```
3. **Access the app**: Open `http://localhost:5000`

## Features Available

✅ **Web Interface** - Simple, clean UI for adding transactions  
✅ **REST API** - Full CRUD operations via `/api/transactions`  
✅ **Swagger UI** - API documentation at the root URL  
✅ **SQLite Database** - No setup required, auto-creates  
✅ **Categories** - Organize your income and expenses  
✅ **Financial Summary** - Track your balance  
✅ **Filtering** - By type, category, date range  

## API Quick Test

```bash
# Add Income
curl -X POST "http://localhost:5000/api/transactions" \
-H "Content-Type: application/json" \
-d '{"description":"Salary","amount":5000,"type":1,"category":"Work","date":"2025-09-25T00:00:00Z"}'

# Add Expense  
curl -X POST "http://localhost:5000/api/transactions" \
-H "Content-Type: application/json" \
-d '{"description":"Groceries","amount":150,"type":2,"category":"Food","date":"2025-09-25T00:00:00Z"}'

# Get Summary
curl "http://localhost:5000/api/transactions/summary"
```

## Deploy to Railway.app

1. **Install Railway CLI**: `npm install -g @railway/cli`
2. **Login**: `railway login`  
3. **Deploy**: `./deploy-railway.sh` or `railway up`

## Transaction Types
- `1` = Income (💰)
- `2` = Expense (💸)

## Common Categories
**Income**: Work, Freelance, Investment, Gift  
**Expense**: Food, Transport, Entertainment, Bills, Shopping

---
*Happy tracking! 📊*