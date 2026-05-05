import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { RegisterRequest, LoginRequest, UserPublic } from '../types';

// Helper: Sign JWT
const signToken = (userId: string, email: string, role: string): string => {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Helper: Format user for response (exclude password)
const formatUser = (user: any): UserPublic => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar_url: user.avatar_url,
  created_at: user.created_at,
});

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export const register = async (
  req: Request<{}, {}, RegisterRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      throw new AppError('An account with this email already exists.', 409);
    }

    // Hash password (salt rounds: 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: 'user',
      })
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);

    // Sign token
    const token = signToken(user.id, user.email, user.role);

    res.status(201).json({
      message: 'Registration successful!',
      token,
      user: formatUser(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login and get JWT token
 * @access  Public
 */
export const login = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single();

    if (error || !user) {
      throw new AppError('Invalid email or password.', 401);
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new AppError('Invalid email or password.', 401);
    }

    // Sign token
    const token = signToken(user.id, user.email, user.role);

    res.json({
      message: 'Login successful!',
      token,
      user: formatUser(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Protected
 */
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, avatar_url, created_at')
      .eq('id', req.user!.userId)
      .single();

    if (error || !user) {
      throw new AppError('User not found.', 404);
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};
