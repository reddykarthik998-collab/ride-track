import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import { initializeDatabase } from './database';
import { createUsersTable, seedDefaultUsers } from './auth';
import seedDatabase from './seed';
import tripsRouter from './routes/trips';
import driversRouter from './routes/drivers';
import clientsRouter from './routes/clients';
import customersRouter from './routes/customers';
import faresRouter from './routes/fares';
import eventsRouter from './routes/events';
import authRouter from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost on any port for development
    if (origin.match(/^http:\/\/localhost:\d+$/)) {
      return callback(null, true);
    }
    
    // Allow specific production domains
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'https://yourdomain.com', // Replace with your production domain
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Reject other origins
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/drivers', driversRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/fares', faresRouter);
app.use('/api/events', eventsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'RideTrack Pro API is running' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    await createUsersTable();
    await seedDatabase();
    await seedDefaultUsers();
    
    app.listen(PORT, () => {
      console.log(`🚀 RideTrack Pro API server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log(`💾 Database: MongoDB Atlas (ridetrack)`);
      console.log(`🔐 Authentication: JWT + Session based`);
      console.log(`👤 Default users:`);
      console.log(`   - Admin: admin / admin123`);
      console.log(`   - Manager: manager / manager123`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();