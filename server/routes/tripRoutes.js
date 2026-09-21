import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  listTrips, createTrip, getTrip, updateTrip, deleteTrip,
  addMember, removeMember, searchUsers, getMessages, sendMessage, votePoll,
} from '../controllers/tripController.js';

const router = Router();
router.use(requireAuth);

router.get('/', listTrips);
router.post('/', createTrip);
router.get('/users/search', searchUsers);
router.get('/:tripId/messages', getMessages);
router.post('/:tripId/messages', sendMessage);
router.post('/:tripId/messages/:messageId/vote', votePoll);
router.put('/:tripId', updateTrip);
router.delete('/:tripId', deleteTrip);
router.post('/:tripId/members', addMember);
router.delete('/:tripId/members/:userId', removeMember);
router.get('/:tripId', getTrip);

export default router;
