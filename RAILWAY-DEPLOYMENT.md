# 🚂 Railway.app Deployment Guide

## Why Railway.app?

Railway.app is perfect for your IncomeExpenseApp because:
- ✅ **Free Tier**: Generous free tier with no credit card required initially
- ✅ **Zero Config**: Automatically detects .NET projects
- ✅ **GitHub Integration**: Auto-deploys from GitHub
- ✅ **Simple**: Easier than most other platforms
- ✅ **SQLite Friendly**: Works perfectly with file-based databases

## Step-by-Step Deployment

### 1. Prepare Your Repository

Make sure your code is pushed to GitHub:
```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### 2. Deploy via Railway Dashboard (Easiest)

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `IncomeExpenseApp` repository
5. Railway will automatically:
   - Detect it's a .NET project
   - Build using the Dockerfile
   - Deploy to a public URL

### 3. Deploy via Railway CLI (Alternative)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize and deploy
cd /path/to/IncomeExpenseApp
railway up
```

### 4. Deploy via Our Script (Simplest)

```bash
./deploy-railway.sh
```

## Configuration Files Included

Your project now includes Railway-specific configurations:

- **`railway.toml`** - Railway build configuration
- **`railway.json`** - Advanced Railway settings  
- **`nixpacks.toml`** - Build instructions
- **`Dockerfile`** - Updated for Railway's PORT handling
- **`deploy-railway.sh`** - Automated deployment script

## Environment Variables

Railway automatically sets:
- `PORT` - Dynamic port assignment
- `RAILWAY_ENVIRONMENT` - Set to "production"

Your app automatically handles these via the updated `Program.cs`.

## Database Persistence

✅ **SQLite files persist** across deployments on Railway  
✅ **No additional database setup** required  
✅ **Data is automatically backed up** by Railway  

## After Deployment

1. **Get Your URL**: Railway provides a public URL like `https://your-app.railway.app`
2. **Test the API**: Visit `/swagger` for API documentation
3. **Use the Web Interface**: The main URL shows your expense tracker
4. **Share**: Your app is now live and accessible worldwide!

## Custom Domain (Optional)

Railway allows you to add a custom domain in the dashboard:
1. Go to your project settings
2. Add your domain
3. Update DNS records as instructed

## Monitoring & Logs

- **Logs**: View real-time logs in Railway dashboard
- **Metrics**: CPU, memory, and request metrics
- **Deployments**: Track deployment history

## Cost

- **Free Tier**: $5/month in usage credits (plenty for personal use)
- **Pro Plan**: $20/month for production apps
- **Pay-as-you-go**: Only pay for resources you use

## Troubleshooting

**Build Issues?**
- Check the build logs in Railway dashboard
- Ensure all files are committed to git

**Database Issues?**
- SQLite files are automatically persisted
- Database recreates if file is corrupted

**Port Issues?**
- Railway handles ports automatically
- No manual configuration needed

---

## 🎉 That's It!

Your IncomeExpenseApp is now configured for Railway deployment. Just push to GitHub or run `./deploy-railway.sh` and you'll have a live, production-ready expense tracking application!

**Next Steps:**
1. Deploy to Railway
2. Share your live URL
3. Start tracking your finances
4. Consider adding authentication for multi-user support

Railway makes deployment incredibly simple - much easier than traditional hosting! 🚂