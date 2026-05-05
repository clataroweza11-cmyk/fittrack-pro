import { Router } from 'express';
import { getProfile, upsertProfile } from '../controllers/profile.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate, profileSchema } from '../middleware/validate.middleware';

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get current user's fitness profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 */
router.get('/', getProfile);

/**
 * @swagger
 * /api/profile:
 *   post:
 *     summary: Create or update fitness profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Profile'
 *     responses:
 *       200:
 *         description: Profile saved
 */
router.post('/', validate(profileSchema), upsertProfile);

export default router;
