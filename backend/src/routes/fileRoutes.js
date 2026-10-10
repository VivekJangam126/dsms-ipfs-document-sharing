import express from 'express';
import { authMiddleware } from '../middlewares/authFirebase.js';
import {
  getDocuments,
  getSharedWithMeDocuments,
  getDocumentById,
  deleteDocument,
  removeSelfFromShared,
} from '../controllers/fileController.js';

const router = express.Router();

router.get('/', authMiddleware, getDocuments);
router.get('/shared-with-me', authMiddleware, getSharedWithMeDocuments);
router.get('/:id', authMiddleware, getDocumentById);
router.delete('/:id', authMiddleware, deleteDocument);
router.post('/:id/remove-self', authMiddleware, removeSelfFromShared);

export default router;
