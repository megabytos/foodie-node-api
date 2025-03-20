import Recipe from "../db/models/Recipe.js";
import HttpError from "../helpers/HttpError.js";
import { Ingredient, Area, Category, User, UserFavorite } from '../db/models/index.js';

export async function listRecipes({ owner, page, limit, favorite, category, ingredient, area }) {
    const where = {}
    if (owner !== undefined) {
        where.ownerId = owner;
    }
    if (category !== undefined) {
        where.categoryId = category;
    }
    if (area !== undefined) {
        where.areaId = area;
    }
    const _limit = Number(limit) > 0 ? Number(limit) : 20;
    const _page = Number(page) > 1 ? Number(page) : 1;
    const offset = (_page - 1) * _limit;
    return await Recipe.findAll({where,  limit:_limit,  offset});
}

export async function getRecipe(query) {
    const recipe = await Recipe.findOne({
        where: query,
        include: [
            { model: Ingredient, attributes: ['name', 'img'], through: { attributes: ['measure'] } },
            { model: User, attributes: ['id', 'name', 'avatar'] },
            { model: Area, attributes: ['id', 'name'] },
            { model: Category, attributes: ['id', 'name'] },
        ],
    });
    if (!recipe) {
        throw HttpError(404, 'Recipe not found');
    }
    return recipe;
}

export async function removeRecipe(query) {
    const recipe = await getRecipe(query);
    await recipe.destroy();
    return recipe;
}

export async function addRecipe(data) {
    return Recipe.create(data);
}

export async function updateRecipeById(query, data) {
    const recipe = await getRecipe(query);
    return recipe.update(data, {returning: true});
}
