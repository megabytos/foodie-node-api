import {
    listRecipes,
    getRecipe,
    addRecipe,
    removeRecipe,
    updateRecipeById,
    getPopularRecipes,
    updateFavoriteStatus,
    getUserOwnRecipes,
} from '../services/recipesServices.js';
import { getCurrentUserData } from '../middlewares/authenticate.js';

export const getAllRecipes = async (req, res) => {
    const userData = getCurrentUserData(req);
    const currentUserId = userData ? userData.id : null;
    const { page = 1, limit = 20, favorite, category, ingredient, area, owner } = req.query;
    res.status(200).json(await listRecipes({ page, limit, favorite, category, ingredient, area, owner, currentUserId }));
};

export const getOneRecipe = async (req, res) => {
    const { id } = req.params;
    const recipe = await getRecipe({ id });
    res.status(200).json(recipe);
};

export const getUserOwnRecipesController = async (req, res) => {
    const { id } = req.user;
    const { id: ownerId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const recipes = await getUserOwnRecipes({ currentUserId: id, ownerId, page, limit });
    res.status(200).json(recipes);
};

export const deleteRecipe = async (req, res) => {
    const { id: ownerId } = req.user;
    const { id } = req.params;
    const recipe = await removeRecipe({ id, ownerId });
    res.status(200).json(recipe);
};

export const createRecipe = async (req, res) => {
    const { id: ownerId } = req.user;
    const file = req.file;
    const recipe = await addRecipe({ body: req.body, file, ownerId });
    res.status(201).json(recipe);
};

export const updateRecipe = async (req, res) => {
    const { id: owner } = req.user;
    const { id } = req.params;
    const recipe = await updateRecipeById({ id, owner }, req.body);
    res.status(200).json(recipe);
};

export const popularRecipes = async (req, res) => {
    const userData = getCurrentUserData(req);
    const currentUserId = userData ? userData.id : null;
    const { limit = 10 } = req.query;
    const recipes = await getPopularRecipes(limit, currentUserId);
    res.status(200).json(recipes);
};

export const updateFavoriteController = async (req, res) => {
    const { id: userId } = req.user;
    const { id: recipeId } = req.params;
    const { favorite } = req.body;

    const result = await updateFavoriteStatus(userId, recipeId, favorite);
    res.status(200).json(result);
};
