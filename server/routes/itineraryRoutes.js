import { Router } from 'express';
import {
  listItineraries,
  getItinerary,
  saveItinerary,
  deleteItinerary,
  inviteMembers,
} from '../controllers/itineraryController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', listItineraries);
router.get('/:tripId', getItinerary);
router.post('/', saveItinerary);
router.post('/:tripId/invite', inviteMembers);
router.delete('/:tripId', deleteItinerary);

export default router;
