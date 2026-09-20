import { Router } from 'express';
import { login, register, me, updateMe } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
const router = Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, me);
router.put('/me', requireAuth, updateMe);
export default router;
