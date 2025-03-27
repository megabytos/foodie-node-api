import express from 'express';
import {
    getAllRecipes,
    getOneRecipe,
    deleteRecipe,
    createRecipe,
    popularRecipes,
    getUserOwnRecipesController,
    addToFavoriteController,
    removeFromFavoriteController,
    getUserFavoriteRecipesController,
} from '../controllers/recipesControllers.js';
import { createRecipeSchema} from '../schemas/recipesSchemas.js';
import validateBody from '../helpers/validateBody.js';
import controllerWrapper from '../helpers/controllerWrapper.js';
import auth from '../middlewares/authenticate.js';
import upload from '../middlewares/upload.js';

const recipesRouter = express.Router();

recipesRouter.get('/', controllerWrapper(getAllRecipes));

recipesRouter.get('/popular', controllerWrapper(popularRecipes));

recipesRouter.get('/:id', controllerWrapper(getOneRecipe));

recipesRouter.delete('/:id', auth, controllerWrapper(deleteRecipe));

recipesRouter.post('/', auth, upload.single('thumb'), validateBody(createRecipeSchema), controllerWrapper(createRecipe));

recipesRouter.get('/:id/own-recipes', auth, controllerWrapper(getUserOwnRecipesController));

recipesRouter.get('/:id/favorite', auth, controllerWrapper(getUserFavoriteRecipesController));

recipesRouter.post('/:id/favorite', auth, controllerWrapper(addToFavoriteController));

recipesRouter.delete('/:id/favorite', auth, controllerWrapper(removeFromFavoriteController));


export default recipesRouter;
