import { Router } from 'express';
import { getProgress, createProgress, deleteProgress } from '../controllers/progress.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * /api/progress:
 *   get:
 *     summary: Get progress logs for current user
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Progress entries
 */
router.get('/', getProgress);

/**
 * @swagger
 * /api/progress:
 *   post:
 *     summary: Upload a progress photo with notes
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               weight:
 *                 type: number
 *               notes:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Progress entry saved
 */
router.post('/', upload.single('image'), createProgress);

/**
 * @swagger
 * /api/progress/{id}:
 *   delete:
 *     summary: Delete a progress entry
 *     tags: [Progress]
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
 *         description: Progress entry deleted
 */
router.delete('/:id', deleteProgress);

export default router;
