import express from 'express';
import { registerRequest, confirmCode, loginUser } from '../controllers/authController.js';
import { upload } from '../utils/upload.js';

const router = express.Router();

router.post('/register', upload.single('image'), registerRequest);
router.post('/confirm', confirmCode);
router.post('/login', loginUser);

export default router;