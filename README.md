# RideTrack Pro

A comprehensive ride tracking and management system built with React, TypeScript, and MongoDB.

## Features

- ✅ **Admin Dashboard**: Manage clients, drivers, vehicles, customers, and trips
- ✅ **Driver Dashboard**: Real-time trip tracking and reporting
- ✅ **Trip Management**: Create, assign, and track trips
- ✅ **Client Management**: Multiple client support with custom prefixes
- ✅ **Event Management**: Organize trips by events
- ✅ **Fare Management**: Flexible pricing models (local/outstation)
- ✅ **Authentication**: JWT-based secure authentication
- ✅ **Cloud Database**: MongoDB Atlas integration

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Context API

### Backend
- Node.js + Express
- TypeScript
- MongoDB Atlas
- JWT Authentication
- bcrypt Password Hashing

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd RideTrack-Pro-main
   ```

2. **Frontend Setup**
   ```bash
   npm install
   npm run dev
   ```

3. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

4. **Configure Backend**
   
   Create `backend/.env` file:
   ```env
   MONGODB_URI=mongodb+srv://your-credentials
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   SESSION_SECRET=your-random-secret
   JWT_SECRET=your-random-secret
   ```

5. **Start Backend**
   ```bash
   npm run dev
   ```

6. **Access the App**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001
   - Admin Login: `admin` / `admin123`

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deployment
- **Frontend**: Deploy to [Vercel](https://vercel.com)
- **Backend**: Deploy to [Railway](https://railway.app)
- **Database**: MongoDB Atlas (already configured)

## API Endpoints

### Trips
- `GET /api/trips` - Get all trips
- `POST /api/trips` - Create new trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip

### Drivers
- `GET /api/drivers` - Get all active drivers
- `POST /api/drivers` - Create new driver
- `PUT /api/drivers/:id` - Update driver

### Clients
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Create new client

### And more...
See `backend/src/routes` for complete API documentation.

## Default Users

- **Admin**: `admin` / `admin123`
- **Manager**: `manager` / `manager123`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

ISC

## Support

For issues or questions, please open an issue on GitHub.
