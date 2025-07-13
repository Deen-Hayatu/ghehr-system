import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    facilityId: string;
  };
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      error: { message: 'Access token required' },
    });
    return;
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'ghehr-secret-key';
    console.log('🔑 JWT_SECRET configured:', jwtSecret ? 'YES' : 'NO');
    console.log('🎫 Received token:', token ? token.substring(0, 20) + '...' : 'NONE');

    const decoded = jwt.verify(token, jwtSecret) as any;
    console.log('✅ Token verified for user:', decoded.email, 'facilityId:', decoded.facilityId);
    req.user = decoded;
    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('❌ Token verification failed:', errorMessage);
    res.status(403).json({
      success: false,
      error: { message: 'Invalid or expired token' },
    });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: { message: 'Insufficient permissions' },
      });
      return;
    }

    next();
  };
};
