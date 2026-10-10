import express from 'express';
import multer from 'multer';
import { authMiddleware } from '../middlewares/authFirebase.js';
import { uploadDocument } from '../controllers/uploadController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', authMiddleware, upload.single('file'), uploadDocument);

export default router;
