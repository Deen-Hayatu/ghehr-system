import express, { Request, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Simple test route
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      data: { 
        patients: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalPatients: 0,
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error fetching patients' },
    });
  }
});

export default router;
