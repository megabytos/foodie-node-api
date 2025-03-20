import { listRecipes, getRecipe, addRecipe, removeRecipe, updateRecipeById, getPopularRecipes, updateFavoriteStatus } from '../services/recipesServices.js';

export const getAllRecipes = async (req, res) => {
    const { id: owner } = req.user ? req.user : 0;
    const { page = 1, limit = 20, favorite, category, ingredient, area } = req.query;
    res.status(200).json(await listRecipes({ owner, page, limit, favorite, category, ingredient, area }));
};

export const getOneRecipe = async (req, res) => {
    const { id } = req.params;
    const recipe = await getRecipe({ id });
    res.status(200).json(recipe);
};

export const deleteRecipe = async (req, res) => {
    const { id: owner } = req.user;
    const { id } = req.params;
    const recipe = await removeRecipe({ id, owner });
    res.status(204).json(recipe);
};

export const createRecipe = async (req, res) => {
    const { id: owner } = req.user;
    const recipe = await addRecipe({ ...req.body, owner });
    res.status(201).json(recipe);
};

export const updateRecipe = async (req, res) => {
    const { id: owner } = req.user;
    const { id } = req.params;
    const recipe = await updateRecipeById({ id, owner }, req.body);
    res.status(200).json(recipe);
};

export const popularRecipes = async (req, res) => {
    const { id: activeUserId } = req.user ? req.user : { id: null };
    const { limit = 10 } = req.query;
    const recipes = await getPopularRecipes(activeUserId, limit);
    res.status(200).json(recipes);
};

export const updateFavoriteController = async (req, res) => {
    const { id: userId } = req.user;
    const { id: recipeId } = req.params;
    const { favorite } = req.body;

    const result = await updateFavoriteStatus(userId, recipeId, favorite);
    res.status(200).json(result);
};