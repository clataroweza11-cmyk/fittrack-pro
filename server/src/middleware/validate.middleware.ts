import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// ─── Auth Validators ──────────────────────────────────────────────────────────

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters.',
    'any.required': 'Name is required.',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address.',
    'any.required': 'Email is required.',
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters.',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
      'any.required': 'Password is required.',
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// ─── Workout Validators ───────────────────────────────────────────────────────

export const workoutSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  type: Joi.string().valid('cardio', 'strength', 'flexibility', 'sports').required(),
  duration: Joi.number().integer().min(1).max(600).required().messages({
    'number.min': 'Duration must be at least 1 minute.',
    'number.max': 'Duration cannot exceed 600 minutes.',
  }),
  calories_burned: Joi.number().integer().min(0).optional(),
  sets: Joi.number().integer().min(1).optional(),
  reps: Joi.number().integer().min(1).optional(),
  weight_used: Joi.number().min(0).optional(),
  notes: Joi.string().max(500).optional().allow(''),
  date: Joi.string().isoDate().optional(),
});

// ─── Profile Validators ───────────────────────────────────────────────────────

export const profileSchema = Joi.object({
  weight: Joi.number().min(20).max(500).optional(),
  height: Joi.number().min(50).max(300).optional(),
  age: Joi.number().integer().min(10).max(120).optional(),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').optional(),
  goal: Joi.string().max(100).optional(),
  activity_level: Joi.string()
    .valid('sedentary', 'light', 'moderate', 'active', 'very_active')
    .optional(),
  target_weight: Joi.number().min(20).max(500).optional(),
  daily_calorie_goal: Joi.number().integer().min(500).max(10000).optional(),
});

// ─── Progress Validators ──────────────────────────────────────────────────────

export const progressSchema = Joi.object({
  weight: Joi.number().min(20).max(500).optional(),
  notes: Joi.string().max(500).optional().allow(''),
  date: Joi.string().isoDate().optional(),
});

// ─── Validate Middleware Factory ──────────────────────────────────────────────

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map((d) => d.message);
      res.status(400).json({
        error: 'Validation failed',
        messages: errors,
      });
      return;
    }

    next();
  };
};
