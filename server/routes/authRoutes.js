import { Router } from 'express';

import {
  login,
  register,
  me,
  updateMe,
  deleteMe,
  changePassword,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';

import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);

router.get('/me', requireAuth, me);
router.put('/me', requireAuth, updateMe);
router.delete('/me', requireAuth, deleteMe);

// Password management
router.put('/change-password', requireAuth, changePassword);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;