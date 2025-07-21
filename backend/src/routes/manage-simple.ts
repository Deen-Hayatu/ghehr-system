import express from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Simple mock data for demonstration
const mockUsers = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@ghehr.com',
    role: 'admin',
    status: 'active',
    lastLogin: new Date().toISOString(),
    createdAt: '2024-01-01T00:00:00Z',
    actions: { edit: true, delete: false }
  },
  {
    id: '2',
    username: 'dr.kwame',
    email: 'kwame@ghehr.com',
    role: 'doctor',
    status: 'active',
    lastLogin: new Date(Date.now() - 86400000).toISOString(),
    createdAt: '2024-01-15T00:00:00Z',
    actions: { edit: true, delete: true }
  }
];

const mockSubscription = {
  id: '1',
  type: 'Basic',
  validity: '30 days',
  signupDate: '2024-01-01T00:00:00Z',
  isActive: true,
  features: [
    'Up to 100 patients',
    'Basic reporting',
    'Email support',
    '5GB storage'
  ],
  price: 50
};

const subscriptionPlans = {
  Basic: {
    price: 50,
    features: [
      'Up to 100 patients',
      'Basic reporting',
      'Email support',
      '5GB storage'
    ]
  },
  Pro: {
    price: 150,
    features: [
      'Up to 1000 patients',
      'Advanced reporting',
      'Priority support',
      '50GB storage',
      'Custom branding',
      'API access'
    ]
  },
  Enterprise: {
    price: 300,
    features: [
      'Unlimited patients',
      'Enterprise reporting',
      '24/7 phone support',
      '500GB storage',
      'Custom branding',
      'API access',
      'Multi-facility support',
      'Advanced security'
    ]
  }
};

const mockBranding = {
  facilityName: 'GhEHR Medical Center',
  primaryColor: '#1a365d',
  secondaryColor: '#fcd116',
  updatedAt: '2024-01-01T00:00:00Z'
};

const mockSettings = {
  preferences: {
    autoLogout: 30,
    dateFormat: 'DD/MM/YYYY' as const,
    theme: 'light' as const,
    language: 'English' as const
  },
  application: {
    favorites: ['patients', 'appointments'],
    customCodes: [
      { code: 'MAL001', description: 'Malaria - Mild', category: 'infectious' },
      { code: 'HYP001', description: 'Hypertension - Stage 1', category: 'cardiovascular' }
    ],
    notifications: {
      email: true,
      sms: false,
      inApp: true
    }
  }
};

const mockAuditTrails = [
  {
    id: '1',
    userId: '1',
    username: 'admin',
    action: 'User Created',
    module: 'Users',
    details: 'Created new doctor account: dr.kwame',
    timestamp: new Date().toISOString(),
    ipAddress: '192.168.1.100'
  },
  {
    id: '2',
    userId: '2',
    username: 'dr.kwame',
    action: 'Patient Created',
    module: 'Patients',
    details: 'Registered new patient: Akua Mensah',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    ipAddress: '192.168.1.101'
  }
];

// Middleware to check admin role
const requireAdmin = (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ 
      success: false, 
      message: 'Admin access required for this operation' 
    });
    return;
  }
  next();
};

// ========================================
// USERS MANAGEMENT
// ========================================

// GET /api/manage/users - List users with filters
router.get('/users', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { status, role } = req.query;
    let users = mockUsers;

    if (status) {
      users = users.filter(user => user.status === status);
    }
    if (role) {
      users = users.filter(user => user.role === role);
    }

    res.json({
      success: true,
      data: users,
      total: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// POST /api/manage/users - Create new user
router.post('/users', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: express.Response): Promise<void> => {
  try {
    const { username, email, role, password } = req.body;

    if (!username || !email || !role || !password) {
      res.status(400).json({
        success: false,
        message: 'Username, email, role, and password are required'
      });
      return;
    }

    const existingUser = mockUsers.find(u => u.username === username || u.email === email);
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this username or email already exists'
      });
      return;
    }

    const newUser = {
      id: (mockUsers.length + 1).toString(),
      username,
      email,
      role,
      status: 'pending' as const,
      lastLogin: '', // Add missing lastLogin property
      createdAt: new Date().toISOString(),
      actions: { edit: true, delete: true }
    };

    mockUsers.push(newUser);

    res.status(201).json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
});

// PATCH /api/manage/users/:id/status - Update user status
router.patch('/users/:id/status', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: express.Response): void => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended', 'deactivated', 'pending'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
      return;
    }

    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    mockUsers[userIndex].status = status;

    res.json({
      success: true,
      data: mockUsers[userIndex],
      message: 'User status updated successfully'
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
});

// DELETE /api/manage/users/:id - Delete user
router.delete('/users/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: express.Response): void => {
  try {
    const { id } = req.params;

    if (req.user?.id === id) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
      return;
    }

    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    mockUsers.splice(userIndex, 1);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// ========================================
// SUBSCRIPTION MANAGEMENT
// ========================================

// GET /api/manage/subscription - Get current subscription
router.get('/subscription', authenticateToken, (req: AuthenticatedRequest, res: express.Response) => {
  try {
    res.json({
      success: true,
      data: mockSubscription
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription details'
    });
  }
});

// GET /api/manage/subscription/plans - Get available plans
router.get('/subscription/plans', authenticateToken, (req: AuthenticatedRequest, res: express.Response) => {
  try {
    res.json({
      success: true,
      data: subscriptionPlans
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription plans'
    });
  }
});

// POST /api/manage/subscription/upgrade - Upgrade subscription
router.post('/subscription/upgrade', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: express.Response): void => {
  try {
    const { plan } = req.body;

    if (!subscriptionPlans[plan as keyof typeof subscriptionPlans]) {
      res.status(400).json({
        success: false,
        message: 'Invalid subscription plan'
      });
      return;
    }

    mockSubscription.type = plan;
    mockSubscription.features = subscriptionPlans[plan as keyof typeof subscriptionPlans].features;
    mockSubscription.price = subscriptionPlans[plan as keyof typeof subscriptionPlans].price;
    mockSubscription.signupDate = new Date().toISOString();

    res.json({
      success: true,
      data: mockSubscription,
      message: `Successfully upgraded to ${plan} plan`
    });
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upgrade subscription'
    });
  }
});

// ========================================
// BRANDING MANAGEMENT
// ========================================

// GET /api/manage/branding - Get branding settings
router.get('/branding', authenticateToken, (req: AuthenticatedRequest, res: express.Response) => {
  try {
    res.json({
      success: true,
      data: mockBranding
    });
  } catch (error) {
    console.error('Error fetching branding:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch branding settings'
    });
  }
});

// PATCH /api/manage/branding - Update branding
router.patch('/branding', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { facilityName, primaryColor, secondaryColor } = req.body;

    if (facilityName) mockBranding.facilityName = facilityName;
    if (primaryColor) mockBranding.primaryColor = primaryColor;
    if (secondaryColor) mockBranding.secondaryColor = secondaryColor;
    
    mockBranding.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      data: mockBranding,
      message: 'Branding updated successfully'
    });
  } catch (error) {
    console.error('Error updating branding:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update branding'
    });
  }
});

// ========================================
// SETTINGS MANAGEMENT
// ========================================

// GET /api/manage/settings - Get settings
router.get('/settings', authenticateToken, (req: AuthenticatedRequest, res: express.Response) => {
  try {
    res.json({
      success: true,
      data: mockSettings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    });
  }
});

// PATCH /api/manage/settings - Update settings
router.patch('/settings', authenticateToken, (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { preferences, application } = req.body;

    if (preferences) {
      Object.assign(mockSettings.preferences, preferences);
    }
    if (application) {
      Object.assign(mockSettings.application, application);
    }

    res.json({
      success: true,
      data: mockSettings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
});

// ========================================
// AUDIT TRAILS
// ========================================

// GET /api/manage/audit-trails - Get audit trails
router.get('/audit-trails', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { module, startDate, endDate, limit = '50' } = req.query;
    let trails = [...mockAuditTrails];

    if (module) {
      trails = trails.filter(trail => trail.module === module);
    }
    if (startDate) {
      trails = trails.filter(trail => trail.timestamp >= (startDate as string));
    }
    if (endDate) {
      trails = trails.filter(trail => trail.timestamp <= (endDate as string));
    }

    // Sort by timestamp descending
    trails.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply limit
    trails = trails.slice(0, Number(limit));

    res.json({
      success: true,
      data: trails,
      total: trails.length
    });
  } catch (error) {
    console.error('Error fetching audit trails:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit trails'
    });
  }
});

export default router;
