import { Router } from 'express';
import {
  getWorkouts,
  getWorkoutStats,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  getAllWorkouts,
} from '../controllers/workout.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/auth.middleware';
import { validate, workoutSchema } from '../middleware/validate.middleware';

const router = Router();

// All workout routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/workouts/stats:
 *   get:
 *     summary: Get workout statistics for current user
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Workout statistics
 */
router.get('/stats', getWorkoutStats);

/**
 * @swagger
 * /api/workouts/all:
 *   get:
 *     summary: Get all workouts from all users (Admin only)
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: All workouts paginated
 *       403:
 *         description: Admin only
 */
router.get('/all', requireAdmin, getAllWorkouts);

/**
 * @swagger
 * /api/workouts:
 *   get:
 *     summary: Get workouts for current user
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [cardio, strength, flexibility, sports]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Paginated workout list
 */
router.get('/', getWorkouts);

/**
 * @swagger
 * /api/workouts:
 *   post:
 *     summary: Log a new workout
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Workout'
 *     responses:
 *       201:
 *         description: Workout created
 *       400:
 *         description: Validation error
 */
router.post('/', validate(workoutSchema), createWorkout);

/**
 * @swagger
 * /api/workouts/{id}:
 *   put:
 *     summary: Update a workout
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workout updated
 *       404:
 *         description: Workout not found
 */
router.put('/:id', updateWorkout);

/**
 * @swagger
 * /api/workouts/{id}:
 *   delete:
 *     summary: Delete a workout
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workout deleted
 */
router.delete('/:id', deleteWorkout);

export default router;
