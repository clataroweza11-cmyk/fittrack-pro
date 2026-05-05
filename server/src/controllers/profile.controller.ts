import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';

/**
 * @route   GET /api/profile
 * @desc    Get current user's fitness profile
 * @access  Protected
 */
export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new AppError(error.message, 500);
    }

    res.json({ profile: profile || null });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/profile
 * @desc    Create or update fitness profile (upsert)
 * @access  Protected
 */
export const upsertProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { weight, height, age, gender, goal, activity_level, target_weight, daily_calorie_goal } = req.body;

    const { data: profile, error } = await supabase
      .from('profiles')
      .upsert(
        {
          user_id: userId,
          weight,
          height,
          age,
          gender,
          goal,
          activity_level,
          target_weight,
          daily_calorie_goal,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);

    res.json({
      message: 'Profile saved successfully!',
      profile,
    });
  } catch (error) {
    next(error);
  }
};
