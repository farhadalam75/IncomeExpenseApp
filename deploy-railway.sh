#!/bin/bash

# Deploy script for Railway.app
echo "🚂 Deploying IncomeExpenseApp to Railway.app..."

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed. Installing now..."
    echo "npm install -g @railway/cli"
    npm install -g @railway/cli
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please log in to Railway first:"
    echo "railway login"
    railway login
fi

echo "📦 Deploying to Railway..."

# Deploy the project
railway up

echo "🎉 Deployment initiated!"
echo "Check your deployment status at: https://railway.app/dashboard"