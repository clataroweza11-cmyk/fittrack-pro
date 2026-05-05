import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

/**
 * Middleware: Verify JWT token from Authorization header
 * Attaches decoded user payload to req.user
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Access denied. No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired. Please login again.' });
    } else {
      res.status(401).json({ error: 'Invalid token.' });
    }
  }
};

/**
 * Middleware: Require admin role
 * Must be used AFTER authenticate middleware
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated.' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    return;
  }

  next();
};

/**
 * Middleware: Require ownership OR admin role
 * For routes like /workouts/:id where users can only edit their own records
 */
export const requireOwnerOrAdmin = (userIdParam: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }

    const resourceUserId = req.params[userIdParam];

    if (req.user.role === 'admin' || req.user.userId === resourceUserId) {
      next();
    } else {
      res.status(403).json({ error: 'Access denied. You can only modify your own resources.' });
    }
  };
};
