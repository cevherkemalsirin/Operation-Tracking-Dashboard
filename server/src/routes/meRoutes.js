import { Router } from 'express';
import {
  changeMyEmail,
  changeMyPassword,
  getMyProfile,
  updateMyProfile,
} from '../controllers/meController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getMyProfile);
router.patch('/', updateMyProfile);
router.patch('/email', changeMyEmail);
router.post('/change-password', changeMyPassword);

export default router;
