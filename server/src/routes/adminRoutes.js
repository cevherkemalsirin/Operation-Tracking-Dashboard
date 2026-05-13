import { Router } from 'express';
import { listUsers } from '../controllers/adminController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

// All /api/admin/* routes require an authenticated admin user.
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

router.get('/users', listUsers);

export default router;
