import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.MONGODB_URI || 'mongodb+srv://ridetrack97_db_user:mz1ATulvmhkXRPMc@ridetrack-pro.br2mvpe.mongodb.net/?appName=ridetrack-pro';

let client: MongoClient | null = null;
let db: Db | null = null;

export const initializeDatabase = async () => {
  try {
    // Connect to MongoDB Atlas
    client = new MongoClient(connectionString);
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    
    db = client.db('ridetrack');
    console.log('✅ Using database: ridetrack');
    
    // Test the connection
    await db.admin().ping();
    console.log('✅ MongoDB connection tested successfully');
    
  } catch (error) {
    console.error('❌ Error initializing MongoDB:', error);
    throw error;
  }
};

export const getDatabase = (): Db => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
};

export const closeDatabase = async () => {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
};

export { client };
export default getDatabase;
