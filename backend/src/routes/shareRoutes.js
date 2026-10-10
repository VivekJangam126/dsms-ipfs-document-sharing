import express from 'express';
import { authMiddleware, optionalAuth } from '../middlewares/authFirebase.js';
import {
  shareDocument,
  getSharedDocument,
  autocompleteUsers,
  getUserShares,
  revokeUserAccess,
} from '../controllers/shareController.js';

const router = express.Router();

router.post('/', authMiddleware, shareDocument);
router.get('/users/autocomplete', authMiddleware, autocompleteUsers);
router.get('/my-shares', authMiddleware, getUserShares);
router.post('/:documentId/revoke', authMiddleware, revokeUserAccess);
router.get('/:shareId', optionalAuth, getSharedDocument);

export default router;
