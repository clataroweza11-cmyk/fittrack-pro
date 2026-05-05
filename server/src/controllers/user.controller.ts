import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Admin
 */
export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from('users')
      .select('id, name, email, role, is_active, avatar_url, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: users, error, count } = await query;

    if (error) throw new AppError(error.message, 500);

    res.json({
      data: users,
      total: count || 0,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil((count || 0) / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID with profile
 * @access  Admin
 */
export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, is_active, avatar_url, created_at')
      .eq('id', id)
      .single();

    if (error || !user) throw new AppError('User not found.', 404);

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', id)
      .single();

    res.json({ user, profile: profile || null });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/users/:id
 * @desc    Update user (Admin can change role/active status)
 * @access  Admin
 */
export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, role, is_active } = req.body;

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (role !== undefined) updates.role = role;
    if (is_active !== undefined) updates.is_active = is_active;

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select('id, name, email, role, is_active, created_at')
      .single();

    if (error || !user) throw new AppError('User not found.', 404);

    res.json({ message: 'User updated.', user });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user (cascades to workouts, progress)
 * @access  Admin
 */
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (req.user!.userId === id) {
      throw new AppError('You cannot delete your own account.', 400);
    }

    const { error } = await supabase.from('users').delete().eq('id', id);

    if (error) throw new AppError(error.message, 500);

    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
