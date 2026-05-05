import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

/**
 * @route   GET /api/progress
 * @desc    Get progress entries for current user
 * @access  Protected
 */
export const getProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { page = 1, limit = 12 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const { data: progress, error, count } = await supabase
      .from('progress')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (error) throw new AppError(error.message, 500);

    res.json({
      data: progress,
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
 * @route   POST /api/progress
 * @desc    Upload progress photo + notes
 * @access  Protected
 */
export const createProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { weight, notes, date } = req.body;
    let imageUrl: string | null = null;

    // Upload image to Supabase Storage if provided
    if (req.file) {
      const fileExt = req.file.mimetype.split('/')[1];
      const fileName = `${userId}/${uuidv4()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('progress-images')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (uploadError) throw new AppError(`Image upload failed: ${uploadError.message}`, 500);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('progress-images')
        .getPublicUrl(uploadData.path);

      imageUrl = urlData.publicUrl;
    }

    const { data: progress, error } = await supabase
      .from('progress')
      .insert({
        user_id: userId,
        image_url: imageUrl,
        weight: weight ? parseFloat(weight) : null,
        notes,
        date: date || new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);

    res.status(201).json({
      message: 'Progress entry saved!',
      progress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/progress/:id
 * @desc    Delete a progress entry
 * @access  Protected (owner or admin)
 */
export const deleteProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const isAdmin = req.user!.role === 'admin';

    const { data: existing } = await supabase
      .from('progress')
      .select('user_id, image_url')
      .eq('id', id)
      .single();

    if (!existing) throw new AppError('Progress entry not found.', 404);
    if (!isAdmin && existing.user_id !== userId) {
      throw new AppError('Not authorized.', 403);
    }

    // Delete image from Supabase Storage if exists
    if (existing.image_url) {
      const path = existing.image_url.split('/progress-images/')[1];
      if (path) {
        await supabase.storage.from('progress-images').remove([path]);
      }
    }

    const { error } = await supabase.from('progress').delete().eq('id', id);
    if (error) throw new AppError(error.message, 500);

    res.json({ message: 'Progress entry deleted.' });
  } catch (error) {
    next(error);
  }
};
