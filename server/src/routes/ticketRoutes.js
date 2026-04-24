import { Router } from 'express';
import { createTicket, deleteTicket, getTickets, updateTicket } from '../controllers/ticketController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getTickets);
router.post('/', authorizeRoles('admin', 'operator'), createTicket);
router.put('/:id', authorizeRoles('admin', 'operator'), updateTicket);
router.delete('/:id', authorizeRoles('admin', 'operator'), deleteTicket);

export default router;
