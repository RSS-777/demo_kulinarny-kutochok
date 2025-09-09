import {
    loginAdmin,
    getAllUsersForAdmin,
    getAllRecipesForAdmin,
    getAllCommentsForAdmin,
    deleteUserByAdmin,
    deleteRecipeByAdmin,
    deleteCommentByAdmin,
    deleteAnswerByAdmin
} from "../controllers/adminController.js"
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import express from 'express';

const router = express.Router();

router.post('/login', loginAdmin);
router.get('/users', adminMiddleware, getAllUsersForAdmin);
router.get('/recipes', adminMiddleware, getAllRecipesForAdmin);
router.get('/comments', adminMiddleware, getAllCommentsForAdmin);
router.delete('/users/:id', adminMiddleware, deleteUserByAdmin);
router.delete('/recipes/:id', adminMiddleware, deleteRecipeByAdmin);
router.delete('/comments/:id', adminMiddleware, deleteCommentByAdmin);
router.delete('/comments/:commentId/answers/:answerId', adminMiddleware, deleteAnswerByAdmin);

export default router;