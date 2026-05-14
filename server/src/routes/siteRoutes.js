import { Router } from 'express';
import { getSite, getSites, getSitesWithTicketSummary } from '../controllers/siteController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getSites);
router.get('/with-ticket-summary', getSitesWithTicketSummary);
router.get('/:siteId', getSite);

export default router;
