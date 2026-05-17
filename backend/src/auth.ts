import getDatabase from './database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const { ObjectId } = require('mongodb');

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'driver';
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'driver';
}

// Create users collection (no-op for MongoDB, collections are created automatically)
export const createUsersTable = async () => {
  try {
    const db = getDatabase();
    // Create indexes for better performance
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });
    
    console.log('Users collection indexed successfully');
  } catch (error) {
    console.error('Error creating users indexes:', error);
    // Continue even if indexing fails (might already exist)
  }
};

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Verify password
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// Generate JWT token
export const generateToken = (user: User): string => {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role: user.role 
    },
    secret,
    { expiresIn: '24h' }
  );
};

// Verify JWT token
export const verifyToken = (token: string): any => {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  return jwt.verify(token, secret);
};

// Register new user
export const registerUser = async (userData: RegisterRequest): Promise<User> => {
  try {
    const { username, email, password, role } = userData;
    const db = getDatabase();
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({
      $or: [{ username }, { email }]
    });
    
    if (existingUser) {
      throw new Error('Username or email already exists');
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Insert user
    const result = await db.collection('users').insertOne({
      username,
      email,
      passwordHash,
      role,
      isActive: true,
      createdAt: new Date(),
      lastLogin: null,
      updatedAt: new Date()
    });
    
    const user: User = {
      id: result.insertedId.toString(),
      username,
      email,
      role,
      isActive: true,
      createdAt: new Date(),
      lastLogin: undefined
    };
    
    return user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Login user
export const loginUser = async (loginData: LoginRequest): Promise<{ user: User; token: string }> => {
  try {
    const { username, password } = loginData;
    const db = getDatabase();
    
    // Find user
    const doc = await db.collection('users').findOne({ 
      username,
      isActive: true
    });
    
    if (!doc) {
      throw new Error('Invalid username or password');
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(password, doc.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid username or password');
    }
    
    // Update last login
    await db.collection('users').updateOne(
      { _id: doc._id },
      { $set: { lastLogin: new Date(), updatedAt: new Date() } }
    );
    
    const user: User = {
      id: doc._id.toString(),
      username: doc.username,
      email: doc.email,
      role: doc.role,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      lastLogin: new Date()
    };
    
    const token = generateToken(user);
    
    return { user, token };
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const db = getDatabase();
    
    const doc = await db.collection('users').findOne({ 
      _id: new ObjectId(id),
      isActive: true
    });
    
    if (!doc) {
      return null;
    }
    
    return {
      id: doc._id.toString(),
      username: doc.username,
      email: doc.email,
      role: doc.role,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      lastLogin: doc.lastLogin
    };
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
};

// Get all users (admin only)
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const db = getDatabase();
    const users = await db.collection('users').find({ isActive: true })
      .sort({ createdAt: -1 })
      .toArray();
    
    return users.map(doc => ({
      id: doc._id.toString(),
      username: doc.username,
      email: doc.email,
      role: doc.role,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      lastLogin: doc.lastLogin
    }));
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

// Update user
export const updateUser = async (id: string, updates: Partial<RegisterRequest>): Promise<User> => {
  try {
    const { username, email, role } = updates;
    const db = getDatabase();
    
    const updateData: any = { updatedAt: new Date() };
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    
    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(id), isActive: true },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result || !result.value) {
      throw new Error('User not found');
    }
    
    const doc = result.value;
    return {
      id: doc._id.toString(),
      username: doc.username,
      email: doc.email,
      role: doc.role,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      lastLogin: doc.lastLogin
    };
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Change password
export const changePassword = async (id: string, currentPassword: string, newPassword: string): Promise<boolean> => {
  try {
    const db = getDatabase();
    
    // Get current password hash
    const doc = await db.collection('users').findOne({
      _id: new ObjectId(id),
      isActive: true
    });
    
    if (!doc) {
      throw new Error('User not found');
    }
    
    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, doc.passwordHash);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }
    
    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);
    
    // Update password
    await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: { passwordHash: newPasswordHash, updatedAt: new Date() } }
    );
    
    return true;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Deactivate user
export const deactivateUser = async (id: string): Promise<boolean> => {
  try {
    const db = getDatabase();
    
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: { isActive: false, updatedAt: new Date() } }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error deactivating user:', error);
    throw error;
  }
};

// Seed default admin user
export const seedDefaultUsers = async () => {
  try {
    const db = getDatabase();
    
    // Check if admin user already exists
    const adminExists = await db.collection('users').findOne({ username: 'admin' });
    
    if (!adminExists) {
      // Create default admin user
      const adminPassword = await hashPassword('admin123');
      await db.collection('users').insertOne({
        username: 'admin',
        email: 'admin@ridetrack.com',
        passwordHash: adminPassword,
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        lastLogin: null,
        updatedAt: new Date()
      });
      
      console.log('Default admin user created (username: admin, password: admin123)');
    }
    
    // Check if manager user exists
    const managerExists = await db.collection('users').findOne({ username: 'manager' });
    
    if (!managerExists) {
      // Create default manager user
      const managerPassword = await hashPassword('manager123');
      await db.collection('users').insertOne({
        username: 'manager',
        email: 'manager@ridetrack.com',
        passwordHash: managerPassword,
        role: 'manager',
        isActive: true,
        createdAt: new Date(),
        lastLogin: null,
        updatedAt: new Date()
      });
      
      console.log('Default manager user created (username: manager, password: manager123)');
    }
    
    console.log('Default users seeded successfully');
  } catch (error) {
    console.error('Error seeding default users:', error);
    throw error;
  }
};

export default getDatabase;
