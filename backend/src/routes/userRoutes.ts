import express from 'express';
import { getUserController, deleteUserController } from '../controllers/userController.js';
import { userMiddleware } from '../middlewares/userMiddleware.js';

const router = express.Router();

router.get('/getUserData', userMiddleware, getUserController);
router.delete('/deleteUser', userMiddleware, deleteUserController);

export default router;