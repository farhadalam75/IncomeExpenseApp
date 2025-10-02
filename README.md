# 📱 Income Expense App# Income Expense App



A full-stack income and expense tracking application with Android APK support and Google Drive sync.A simple ASP.NET Core Web API for managing personal income and expense transactions, similar to MoneyPro app.



## ✨ Features## Features



- ✅ Track income and expense transactions- ✅ Add, edit, and delete income transactions

- ✅ Multiple account management- ✅ Add, edit, and delete expense transactions

- ✅ Transfer between accounts- ✅ Categorize transactions

- ✅ Category management- ✅ Filter transactions by type, category, and date range

- ✅ Google Drive data backup/restore- ✅ View financial summary (total income, expenses, balance)

- ✅ Progressive Web App (PWA) with offline support- ✅ SQLite database (no SQL Server required)

- ✅ Android APK via GitHub Actions- ✅ RESTful API with Swagger documentation

- ✅ Mobile-optimized responsive UI- ✅ Ready for deployment on Railway.app



## 🏗️ Tech Stack## Tech Stack



### Backend- **Backend**: ASP.NET Core 8.0 Web API

- **Framework**: ASP.NET Core 8.0 Web API- **Database**: SQLite with Entity Framework Core

- **Database**: SQLite with Entity Framework Core- **Documentation**: Swagger/OpenAPI

- **Authentication**: JWT tokens- **Deployment**: Ready for Railway.app

- **API Documentation**: Swagger/OpenAPI

## API Endpoints

### Frontend

- **Framework**: React 18 with TypeScript### Transactions

- **Mobile**: Capacitor for native Android- `GET /api/transactions` - Get all transactions (with filtering and pagination)

- **PWA**: Service Worker for offline functionality- `GET /api/transactions/{id}` - Get specific transaction

- **UI**: Custom CSS with mobile-first design- `POST /api/transactions` - Create new transaction

- `PUT /api/transactions/{id}` - Update transaction

## 🚀 Running the Application- `DELETE /api/transactions/{id}` - Delete transaction



### Backend API### Summary & Analytics

- `GET /api/transactions/summary` - Get financial summary

1. **Navigate to backend directory**:- `GET /api/transactions/categories` - Get all categories

   ```bash

   cd IncomeExpenseApp### Health Check

   ```- `GET /health` - API health status



2. **Restore and run**:## Getting Started

   ```bash

   dotnet restore### Prerequisites

   dotnet run- .NET 8.0 SDK

   ```- Visual Studio Code or Visual Studio



3. **Access API**:### Running Locally

   - API: `http://localhost:5000`

   - Swagger: `http://localhost:5000/swagger`1. **Clone and navigate to the project**:

   ```bash

### Frontend Website   git clone https://github.com/farhadalam75/IncomeExpenseApp.git

   cd IncomeExpenseApp/IncomeExpenseApp

1. **Navigate to frontend directory**:   ```

   ```bash

   cd IncomeExpenseApp/ClientApp2. **Restore packages**:

   ```   ```bash

   dotnet restore

2. **Install dependencies**:   ```

   ```bash

   npm install3. **Run the application**:

   ```   ```bash

   dotnet run

3. **Start development server**:   ```

   ```bash

   npm start4. **Open Swagger UI**:

   ```   Navigate to `https://localhost:5001` or `http://localhost:5000`



4. **Access website**:### Database

   - Website: `http://localhost:3000`

The app uses SQLite and will automatically create the database file (`incomeexpense.db`) on first run. No additional setup required!

## 📱 Building Android APK

## Sample API Usage

### ⚡ Automated Build (Recommended)

### Create an Income Transaction

The project uses **GitHub Actions** to automatically build Android APKs.```bash

curl -X POST "https://localhost:5001/api/transactions" \

#### How it works:-H "Content-Type: application/json" \

-d '{

1. **Push to main branch** → Triggers APK build automatically  "description": "Salary",

2. **Create a version tag** → Builds APK and creates GitHub Release  "amount": 5000.00,

3. **Manual trigger** → Run workflow anytime from Actions tab  "type": 1,

  "category": "Work",

#### To create a release with APK:  "date": "2025-09-25T00:00:00Z",

  "notes": "Monthly salary"

```bash}'

# Commit your changes```

git add .

git commit -m "feat: Your changes"### Create an Expense Transaction

git push origin main```bash

curl -X POST "https://localhost:5001/api/transactions" \

# Create a version tag-H "Content-Type: application/json" \

git tag v1.0.0-d '{

git push origin v1.0.0  "description": "Groceries",

```  "amount": 150.00,

  "type": 2,

#### Download APK:  "category": "Food",

  "date": "2025-09-25T00:00:00Z",

- **From GitHub Actions**: Go to Actions → Select workflow run → Download artifacts  "notes": "Weekly shopping"

- **From GitHub Releases**: Go to Releases → Download APK from latest release}'

```

### 📋 APK Build Process

### Get Financial Summary

The GitHub Actions workflow automatically:```bash

curl -X GET "https://localhost:5001/api/transactions/summary"

1. ✅ Sets up Node.js 18 and Java 21```

2. ✅ Installs Android SDK (API 34)

3. ✅ Builds React production bundle## Transaction Types

4. ✅ Configures Capacitor with correct settings

5. ✅ Generates Android project- `1` = Income

6. ✅ Builds debug APK- `2` = Expense

7. ✅ Uploads APK as artifact

8. ✅ Creates GitHub Release (on version tags)## Deployment on Railway.app



## 🔐 Google Drive Sync Setup1. **Install Railway CLI**:

   ```bash

### Backend Configuration   npm install -g @railway/cli

   ```

1. **Get Google Drive API credentials**:

   - Go to [Google Cloud Console](https://console.cloud.google.com/)2. **Login to Railway**:

   - Create a new project   ```bash

   - Enable Google Drive API   railway login

   - Create OAuth 2.0 credentials   ```

   - Download credentials JSON

3. **Deploy the app**:

2. **Configure backend**:   ```bash

   - Update `GoogleDriveSyncService.cs` with your credentials   ./deploy-railway.sh

   - Or use environment variables   ```

   Or manually: `railway up`

### Frontend Usage

The app includes Railway-specific configurations (`railway.toml`, `railway.json`, `nixpacks.toml`) for seamless deployment.

1. Go to **Settings** page in the app

2. Click **"Connect Google Drive"**## Detailed Railway Deployment

3. Authorize the application

4. Use **"Backup Now"** to save data to Google DriveFor comprehensive Railway.app deployment instructions, see [RAILWAY-DEPLOYMENT.md](RAILWAY-DEPLOYMENT.md)

5. Use **"Restore Data"** to restore from Google Drive

## Project Structure

## 📂 Project Structure

```

```IncomeExpenseApp/

IncomeExpenseApp/├── Controllers/

├── .github/│   └── TransactionsController.cs    # API endpoints

│   └── workflows/├── Data/

│       └── build-android.yml         # APK build automation│   └── AppDbContext.cs              # Entity Framework context

├── IncomeExpenseApp/├── Models/

│   ├── Controllers/                  # API endpoints│   ├── Transaction.cs               # Main transaction model

│   │   ├── TransactionsController.cs│   └── DTOs/

│   │   ├── AccountsController.cs│       └── TransactionDtos.cs       # Data transfer objects

│   │   ├── CategoriesController.cs├── Program.cs                       # Application startup

│   │   ├── AuthController.cs├── IncomeExpenseApp.csproj         # Project file

│   │   └── SyncController.cs├── Dockerfile                      # Docker configuration

│   ├── Data/├── railway.toml                    # Railway configuration

│   │   └── AppDbContext.cs          # EF Core context├── railway.json                    # Railway deployment settings

│   ├── Models/                       # Data models└── deploy-railway.sh               # Deployment script

│   ├── Services/```

│   │   └── GoogleDriveSyncService.cs # Sync service

│   ├── ClientApp/                    # React frontend## Contributing

│   │   ├── src/

│   │   │   ├── components/          # React components1. Fork the repository

│   │   │   ├── services/            # API services2. Create a feature branch

│   │   │   └── App.tsx              # Main app3. Make your changes

│   │   ├── public/4. Submit a pull request

│   │   │   ├── manifest.json        # PWA manifest

│   │   │   └── sw.js                # Service worker## License

│   │   ├── android/                 # Capacitor Android (generated)

│   │   ├── capacitor.config.ts      # Capacitor configThis project is open source and available under the [MIT License](LICENSE).
│   │   └── package.json
│   └── Program.cs                   # ASP.NET startup
└── README.md
```

## 🛠️ API Endpoints

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/{id}` - Get specific transaction
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction
- `GET /api/transactions/summary` - Get financial summary

### Accounts
- `GET /api/accounts` - Get all accounts
- `POST /api/accounts` - Create account
- `PUT /api/accounts/{id}` - Update account
- `DELETE /api/accounts/{id}` - Delete account

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

### Sync
- `POST /api/sync/backup` - Backup data to Google Drive
- `POST /api/sync/restore` - Restore data from Google Drive
- `GET /api/sync/auth` - Google Drive authentication

## 📱 Installing APK on Android

1. Download APK from GitHub Releases or Actions
2. Transfer to your Android device
3. Enable "Install from Unknown Sources" in Settings
4. Tap the APK file to install
5. Open the app and start tracking!

## 🌐 Alternative: PWA Installation

For easier distribution without APK files:

1. Deploy the app to any web host
2. Open in Chrome mobile browser
3. Tap "Add to Home Screen"
4. App installs like a native app
5. Works offline with service worker

## 🔧 Development

### Prerequisites
- .NET 8.0 SDK
- Node.js 18+
- Java 21 (for Android builds)
- Android SDK (for local APK building)

### Local Development

```bash
# Terminal 1 - Backend
cd IncomeExpenseApp
dotnet run

# Terminal 2 - Frontend
cd IncomeExpenseApp/ClientApp
npm start
```

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Made with ❤️ for personal finance tracking**
