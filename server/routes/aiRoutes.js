import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { travelPlan } from '../controllers/aiController.js';

const router = Router();
router.use(requireAuth);
router.post('/travel-plan', travelPlan);

export default router;