import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.post('/', (req, res) => {
  const message = req.body?.message || '';

  return res.json({
    reply: `Backend received: ${message}`,
  });
});

export default router;
