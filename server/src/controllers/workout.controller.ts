import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { PaginationQuery } from '../types';

/**
 * @route   GET /api/workouts
 * @desc    Get workouts for current user (paginated, searchable, filterable)
 * @access  Protected
 */
export const getWorkouts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const {
      page = 1,
      limit = 10,
      search = '',
      type = '',
      startDate = '',
      endDate = '',
    } = req.query as unknown as PaginationQuery;

    const offset = (Number(page) - 1) * Number(limit);

    // Build query
    let query = supabase
      .from('workouts')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    // Search by name/notes
    if (search) {
      query = query.or(`name.ilike.%${search}%,notes.ilike.%${search}%`);
    }

    // Filter by type
    if (type) {
      query = query.eq('type', type);
    }

    // Filter by date range
    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data: workouts, error, count } = await query;

    if (error) throw new AppError(error.message, 500);

    const total = count || 0;
    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      data: workouts,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/workouts/stats
 * @desc    Get workout statistics for current user
 * @access  Protected
 */
export const getWorkoutStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const { data: workouts, error } = await supabase
      .from('workouts')
      .select('type, duration, calories_burned, date')
      .eq('user_id', userId);

    if (error) throw new AppError(error.message, 500);

    if (!workouts || workouts.length === 0) {
      res.json({
        totalWorkouts: 0,
        totalMinutes: 0,
        totalCalories: 0,
        workoutsByType: {},
        averageDuration: 0,
        streakDays: 0,
      });
      return;
    }

    // Calculate stats
    const totalWorkouts = workouts.length;
    const totalMinutes = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const totalCalories = workouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0);
    const averageDuration = Math.round(totalMinutes / totalWorkouts);

    const workoutsByType = workouts.reduce((acc, w) => {
      acc[w.type] = (acc[w.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate streak (consecutive days with workouts)
    const sortedDates = [...new Set(workouts.map(w => w.date))].sort().reverse();
    let streakDays = 0;
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const dateStr of sortedDates) {
      const workoutDate = new Date(dateStr);
      const diffDays = Math.floor((today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === streakDays) {
        streakDays++;
      } else {
        break;
      }
    }

    res.json({
      totalWorkouts,
      totalMinutes,
      totalCalories,
      workoutsByType,
      averageDuration,
      streakDays,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/workouts
 * @desc    Create a new workout log
 * @access  Protected
 */
export const createWorkout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { name, type, duration, calories_burned, sets, reps, weight_used, notes, date } = req.body;

    const { data: workout, error } = await supabase
      .from('workouts')
      .insert({
        user_id: userId,
        name,
        type,
        duration,
        calories_burned,
        sets,
        reps,
        weight_used,
        notes,
        date: date || new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);

    res.status(201).json({
      message: 'Workout logged successfully!',
      workout,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/workouts/:id
 * @desc    Update a workout
 * @access  Protected (owner or admin)
 */
export const updateWorkout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const isAdmin = req.user!.role === 'admin';

    // Verify ownership
    const { data: existing } = await supabase
      .from('workouts')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing) throw new AppError('Workout not found.', 404);
    if (!isAdmin && existing.user_id !== userId) {
      throw new AppError('Not authorized to update this workout.', 403);
    }

    const { data: workout, error } = await supabase
      .from('workouts')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);

    res.json({ message: 'Workout updated.', workout });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/workouts/:id
 * @desc    Delete a workout
 * @access  Protected (owner or admin)
 */
export const deleteWorkout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const isAdmin = req.user!.role === 'admin';

    const { data: existing } = await supabase
      .from('workouts')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing) throw new AppError('Workout not found.', 404);
    if (!isAdmin && existing.user_id !== userId) {
      throw new AppError('Not authorized to delete this workout.', 403);
    }

    const { error } = await supabase.from('workouts').delete().eq('id', id);

    if (error) throw new AppError(error.message, 500);

    res.json({ message: 'Workout deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/workouts/all (Admin)
 * @desc    Get ALL workouts from all users
 * @access  Admin only
 */
export const getAllWorkouts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const { data: workouts, error, count } = await supabase
      .from('workouts')
      .select(`*, users(name, email)`, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (error) throw new AppError(error.message, 500);

    res.json({
      data: workouts,
      total: count || 0,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil((count || 0) / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};
