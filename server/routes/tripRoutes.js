import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { listTrips, createTrip, getTrip, updateTrip, addMember, searchUsers, getMessages, sendMessage } from '../controllers/tripController.js';

const router = Router();
router.use(requireAuth);

router.get('/', listTrips);
router.post('/', createTrip);
router.get('/users/search', searchUsers);
router.get('/:tripId/messages', getMessages);
router.post('/:tripId/messages', sendMessage);
router.put('/:tripId', updateTrip);
router.post('/:tripId/members', addMember);
router.get('/:tripId', getTrip);

export default router;
