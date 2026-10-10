import express from 'express';
import { authMiddleware } from '../middlewares/authFirebase.js';
import { getLogs, getLogStats } from '../controllers/logsController.js';

const router = express.Router();

router.get('/', authMiddleware, getLogs);
router.get('/stats', authMiddleware, getLogStats);

export default router;
