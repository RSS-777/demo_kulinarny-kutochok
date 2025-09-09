import express from 'express';
import { createRecipe, getRecipes, deleteRecipe, updateRecipe } from '../controllers/recipeController.js';
import { upload } from '../utils/upload.js';
import { userMiddleware } from '../middlewares/userMiddleware.js';
import { compressingImage } from '../middlewares/compressingImage.js';

const router = express.Router()

router.post('/create', upload.single('photo'), compressingImage, createRecipe)
router.get('/getRecipes', getRecipes)
router.delete('/delete/:id', userMiddleware, deleteRecipe)
router.put('/update/:id', userMiddleware, upload.single('photo'), compressingImage, updateRecipe)

export default router;