# Deployment Guide for RideTrack Pro

This project consists of two parts:
1. **Frontend**: React + Vite (deploy to Vercel)
2. **Backend**: Express + MongoDB (deploy to Railway)

---

## Step 1: Deploy Backend to Railway

### 1.1 Create Railway Account
- Go to https://railway.app
- Sign up with GitHub

### 1.2 Deploy Backend
- Click "New Project" → "Deploy from GitHub"
- Select your repository
- Select the `backend` folder as the root directory
- Railway will automatically detect Node.js

### 1.3 Set Environment Variables
In Railway dashboard, add these environment variables:

```env
MONGODB_URI=mongodb+srv://reddykarthik998_db_user:MFP9XhWmZ6E4qbgQ@ridetrack.8w6ek67.mongodb.net/?appName=ridetrack
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
SESSION_SECRET=your-random-secret-key-here
JWT_SECRET=your-random-jwt-secret-here
```

### 1.4 Get Backend URL
- Railway will provide a URL like `https://your-app.railway.app`
- Copy this URL - you'll need it for frontend deployment

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Account
- Go to https://vercel.com
- Sign up with GitHub

### 2.2 Deploy Frontend
- Click "Add New Project"
- Import your GitHub repository
- Configure:
  - **Framework Preset**: Vite
  - **Root Directory**: `./` (root of repo)
  - **Build Command**: `npm run build`
  - **Output Directory**: `dist`

### 2.3 Set Environment Variables
In Vercel dashboard, add:

```
VITE_API_URL=https://your-backend-url.railway.app/api
```

Replace `your-backend-url.railway.app` with your actual Railway backend URL.

### 2.4 Deploy
- Click "Deploy"
- Wait for build to complete
- Get your frontend URL (e.g., `https://your-app.vercel.app`)

---

## Step 3: Update Backend FRONTEND_URL

After frontend is deployed, go back to Railway and update:

```env
FRONTEND_URL=https://your-actual-frontend-url.vercel.app
```

This allows CORS to work properly.

---

## Step 4: Test

1. Visit your Vercel frontend URL
2. Log in with `admin` / `admin123`
3. Test the application

---

## Troubleshooting

### Backend not connecting?
- Check Railway logs for errors
- Verify MongoDB URI is correct
- Check environment variables

### Frontend can't connect to backend?
- Verify `VITE_API_URL` is set correctly
- Check backend CORS settings
- Check network tab in browser console

### CORS errors?
- Make sure `FRONTEND_URL` in Railway matches your Vercel URL exactly
- Check backend is allowing requests from frontend domain

---

## Cost Estimate

- **Railway Backend**: Free tier available (good for testing)
- **MongoDB Atlas**: Free tier (512MB storage)
- **Vercel Frontend**: Free tier (unlimited builds)

**Total Monthly Cost: $0** (for small projects)

---

## Next Steps

1. Set up custom domains (optional)
2. Enable SSL certificates (automatic)
3. Set up CI/CD for automatic deployments
4. Monitor logs and performance

---

**Need Help?**
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs

