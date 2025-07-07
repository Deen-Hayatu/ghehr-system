import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Mock user data (replace with database in production)
const users = [
  {
    id: '1',
    email: 'admin@ghehr.gh',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'admin',
    facilityId: 'facility_1',
    name: 'System Administrator'
  },
  {
    id: '2',
    email: 'doctor@ghehr.gh',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'doctor',
    facilityId: 'facility_1',
    name: 'Dr. Kwame Asante'
  }
];

// Login route
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid input', details: errors.array() },
      });
      return;
    }

    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' },
      });
      return;
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' },
      });
      return;
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'ghehr-secret-key';
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        facilityId: user.facilityId,
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          facilityId: user.facilityId,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Server error during authentication' },
    });
  }
});

// Register route (for initial setup)
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').isLength({ min: 2 }),
  body('role').isIn(['doctor', 'nurse', 'admin', 'receptionist']),
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid input', details: errors.array() },
      });
      return;
    }

    const { email, password, name, role, facilityId } = req.body;

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: { message: 'User already exists' },
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user (in production, save to database)
    const newUser = {
      id: (users.length + 1).toString(),
      email,
      password: hashedPassword,
      role,
      facilityId: facilityId || 'facility_1',
      name,
    };

    users.push(newUser);

    res.status(201).json({
      success: true,
      data: {
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          name: newUser.name,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Server error during registration' },
    });
  }
});

export default router;
