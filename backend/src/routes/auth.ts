import { Router, Request, Response } from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserById, 
  getAllUsers, 
  updateUser, 
  changePassword, 
  deactivateUser,
  verifyToken,
  RegisterRequest,
  LoginRequest,
  User
} from '../auth';
import { AuthenticatedRequest, AuthenticatedUser } from '../types/auth';

const router = Router();

// Middleware to verify JWT token
export const authenticateToken = (req: Request, res: Response, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = verifyToken(token) as AuthenticatedUser;
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Middleware to check admin role
export const requireAdmin = (req: Request, res: Response, next: any) => {
  const user = (req as any).user;
  if (user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Middleware to check manager or admin role
export const requireManager = (req: Request, res: Response, next: any) => {
  const user = (req as any).user;
  if (!['admin', 'manager'].includes(user?.role)) {
    return res.status(403).json({ error: 'Manager or admin access required' });
  }
  next();
};

// POST /api/auth/register - Register new user (admin only)
router.post('/register', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const userData: RegisterRequest = req.body;
    
    // Validate required fields
    if (!userData.username || !userData.email || !userData.password || !userData.role) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Validate password strength
    if (userData.password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    
    // Validate role
    if (!['admin', 'manager', 'driver'].includes(userData.role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const user = await registerUser(userData);
    
    // Don't return password hash
    const { password, ...userWithoutPassword } = user as any;
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword
    });
  } catch (error: any) {
    console.error('Error registering user:', error);
    res.status(400).json({ error: error.message });
  }
});

// POST /api/auth/login - Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const loginData: LoginRequest = req.body;
    
    // Validate required fields
    if (!loginData.username || !loginData.password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const { user, token } = await loginUser(loginData);
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      },
      token
    });
  } catch (error: any) {
    console.error('Error logging in:', error);
    res.status(401).json({ error: error.message });
  }
});

// GET /api/auth/me - Get current user info
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await getUserById((req as any).user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error: any) {
    console.error('Error getting user info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/users - Get all users (admin only)
router.get('/users', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    
    res.json({
      users: users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }))
    });
  } catch (error: any) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/auth/users/:id - Update user (admin only)
router.put('/users/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Validate role if provided
    if (updates.role && !['admin', 'manager', 'driver'].includes(updates.role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const user = await updateUser(id, updates);
    
    res.json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    res.status(400).json({ error: error.message });
  }
});

// POST /api/auth/change-password - Change password
router.post('/change-password', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }
    
    await changePassword((req as any).user.id, currentPassword, newPassword);
    
    res.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    console.error('Error changing password:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/auth/users/:id - Deactivate user (admin only)
router.delete('/users/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from deactivating themselves
    if (id === (req as any).user.id) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }
    
    const success = await deactivateUser(id);
    
    if (!success) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deactivated successfully' });
  } catch (error: any) {
    console.error('Error deactivating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/logout - Logout (client-side token removal)
router.post('/logout', authenticateToken, async (req: Request, res: Response) => {
  res.json({ message: 'Logout successful' });
});

export default router;
