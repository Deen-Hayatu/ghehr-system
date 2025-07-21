import express from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Simple mock data
let mockUsers = [
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

// Admin middleware
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

// GET /api/manage/users
router.get('/users', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: express.Response): void => {
  try {
    res.json({
      success: true,
      data: mockUsers,
      total: mockUsers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// POST /api/manage/users
router.post('/users', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: express.Response): void => {
  try {
    const { username, email, role, password } = req.body;

    if (!username || !email || !role || !password) {
      res.status(400).json({
        success: false,
        message: 'Username, email, role, and password are required'
      });
      return;
    }

    const newUser = {
      id: (mockUsers.length + 1).toString(),
      username,
      email,
      role,
      status: 'pending',
      lastLogin: '',
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
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
});

// PATCH /api/manage/users/:id/status
router.patch('/users/:id/status', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: express.Response): void => {
  try {
    const { id } = req.params;
    const { status } = req.body;

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
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
});

// DELETE /api/manage/users/:id
router.delete('/users/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: express.Response): void => {
  try {
    const { id } = req.params;
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
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// GET /api/manage/subscription
router.get('/subscription', authenticateToken, (req: AuthenticatedRequest, res: express.Response): void => {
  try {
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

    res.json({
      success: true,
      data: mockSubscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription details'
    });
  }
});

// GET /api/manage/subscription/plans
router.get('/subscription/plans', authenticateToken, (req: AuthenticatedRequest, res: express.Response): void => {
  try {
    const plans = {
      Basic: {
        price: 50,
        features: ['Up to 100 patients', 'Basic reporting', 'Email support', '5GB storage']
      },
      Pro: {
        price: 150,
        features: ['Up to 1000 patients', 'Advanced reporting', 'Priority support', '50GB storage', 'Custom branding', 'API access']
      },
      Enterprise: {
        price: 300,
        features: ['Unlimited patients', 'Enterprise reporting', '24/7 phone support', '500GB storage', 'Custom branding', 'API access', 'Multi-facility support', 'Advanced security']
      }
    };

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription plans'
    });
  }
});

// POST /api/manage/subscription/upgrade
router.post('/subscription/upgrade', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: express.Response): void => {
  try {
    const { plan } = req.body;

    res.json({
      success: true,
      data: { plan, message: `Successfully upgraded to ${plan} plan` },
      message: `Successfully upgraded to ${plan} plan`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upgrade subscription'
    });
  }
});

// GET /api/manage/branding
router.get('/branding', authenticateToken, (req: AuthenticatedRequest, res: express.Response): void => {
  try {
    const mockBranding = {
      facilityName: 'GhEHR Medical Center',
      primaryColor: '#1a365d',
      secondaryColor: '#fcd116',
      updatedAt: '2024-01-01T00:00:00Z'
    };

    res.json({
      success: true,
      data: mockBranding
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch branding settings'
    });
  }
});

// PATCH /api/manage/branding
router.patch('/branding', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: express.Response): void => {
  try {
    const { facilityName, primaryColor, secondaryColor } = req.body;

    res.json({
      success: true,
      data: { facilityName, primaryColor, secondaryColor, updatedAt: new Date().toISOString() },
      message: 'Branding updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update branding'
    });
  }
});

// GET /api/manage/settings
router.get('/settings', authenticateToken, (req: AuthenticatedRequest, res: express.Response): void => {
  try {
    const mockSettings = {
      preferences: {
        autoLogout: 30,
        dateFormat: 'DD/MM/YYYY',
        theme: 'light',
        language: 'English'
      },
      application: {
        favorites: ['patients', 'appointments'],
        customCodes: [
          { code: 'MAL001', description: 'Malaria - Mild', category: 'infectious' }
        ],
        notifications: {
          email: true,
          sms: false,
          inApp: true
        }
      }
    };

    res.json({
      success: true,
      data: mockSettings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    });
  }
});

// PATCH /api/manage/settings
router.patch('/settings', authenticateToken, (req: AuthenticatedRequest, res: express.Response): void => {
  try {
    res.json({
      success: true,
      data: req.body,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
});

// GET /api/manage/audit-trails
router.get('/audit-trails', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: express.Response): void => {
  try {
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

    res.json({
      success: true,
      data: mockAuditTrails,
      total: mockAuditTrails.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit trails'
    });
  }
});

export default router;
