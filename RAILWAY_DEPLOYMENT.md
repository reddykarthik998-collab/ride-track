# Deploy RideTrack Pro to Railway

Railway allows you to deploy **both frontend and backend** from a single repository with minimal configuration.

## Quick Deploy Steps

### 1. Create Railway Account
- Go to https://railway.app
- Sign up with GitHub

### 2. Deploy Your Repository
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your repository
- Railway will auto-detect and set up the project

### 3. Configure Services

Railway will detect both frontend and backend, but you need to configure them:

#### Backend Service
1. Railway auto-detects `backend/` folder
2. Add environment variables in Railway dashboard:

```env
MONGODB_URI=mongodb+srv://ridetrack97_db_user:mz1ATulvmhkXRPMc@ridetrack-pro.br2mvpe.mongodb.net/?appName=ridetrack-pro
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-service.railway.app
SESSION_SECRET=your-random-secret-key
JWT_SECRET=your-random-jwt-secret
```

#### Frontend Service
1. Create a new service for frontend
2. Set **Root Directory** to `/` (root)
3. Set **Build Command**: `npm run build:frontend`
4. Set **Start Command**: `npm run preview`
5. Set **Output Directory**: `dist`

Add environment variable:
```env
VITE_API_URL=https://your-backend-service.railway.app/api
```

### 4. Network Services

Make sure services can communicate:
- Backend exposes port 3001
- Frontend can reach backend via the generated URL

### 5. Generate Domains

Railway automatically generates URLs:
- Backend: `https://your-app-production.up.railway.app`
- Frontend: `https://your-frontend.up.railway.app`

## Cost

**Free Tier Available:**
- $5 credit per month
- Perfect for testing and small projects
- Pay-as-you-go after credit exhausted

## Architecture

```
┌─────────────────┐
│   Frontend      │ (Vite + React)
│   Railway       │ → dist folder
└────────┬────────┘
         │
         │ API calls
         ↓
┌─────────────────┐
│   Backend       │ (Express + Node.js)
│   Railway       │ → backend/ folder
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  MongoDB Atlas  │ (Cloud Database)
└─────────────────┘
```

## Environment Variables Summary

### Backend
- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (Railway sets this automatically)
- `NODE_ENV` - `production`
- `FRONTEND_URL` - Your frontend Railway URL
- `SESSION_SECRET` - Random secret
- `JWT_SECRET` - Random secret

### Frontend
- `VITE_API_URL` - Backend Railway URL + `/api`

## Troubleshooting

### Services not connecting?
- Check both services are running
- Verify `VITE_API_URL` points to backend URL
- Check backend CORS settings

### Build failures?
- Check Railway logs
- Verify all dependencies installed
- Check environment variables

### Database connection issues?
- Verify MongoDB URI is correct
- Check MongoDB Atlas network access (allow all IPs)
- Check Railway logs for connection errors

## Advantages of Railway

✅ **Single Deployment** - Both frontend and backend in one place
✅ **Easy Configuration** - Auto-detects and configures
✅ **Free Tier** - $5 credit per month
✅ **Auto HTTPS** - SSL certificates automatically
✅ **GitHub Integration** - Auto-deploy on push
✅ **Logs & Monitoring** - Built-in observability

## Next Steps

1. After deployment, test the application
2. Set up custom domains (optional)
3. Enable monitoring and alerts
4. Set up staging environment

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

