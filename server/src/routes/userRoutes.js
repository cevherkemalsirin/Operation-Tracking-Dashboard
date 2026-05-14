import { Router } from 'express';
import { getMentionNotifications, getUsers, updateUserRole } from '../controllers/userController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);
router.get('/notifications/mentions', getMentionNotifications);
router.get('/', getUsers);
router.patch('/:id/role', authorizeRoles('admin'), updateUserRole);

export default router;
