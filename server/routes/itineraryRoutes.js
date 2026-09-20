import { Router } from 'express';
import { listItineraries, saveItinerary, deleteItinerary } from '../controllers/itineraryController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
const router = Router();
router.use(requireAuth);
router.get('/', listItineraries);
router.post('/', saveItinerary);
router.delete('/:tripId', deleteItinerary);
export default router;
