import Recipe from '../db/models/Recipe.js';
import HttpError from '../helpers/HttpError.js';
import sequelize from '../db/sequelize.js';
import { Sequelize } from 'sequelize';

import { Ingredient, Area, Category, User, UserFavorite, RecipeIngredient } from '../db/models/index.js';

export async function listRecipes({ page, limit, favorite, category, ingredient, area, owner, currentUserId}) {
    const where = {};
    const include = [{ model: User, attributes: ['id', 'name', 'avatar'] }];
    if (owner) where.ownerId = owner;
    if (category) where.categoryId = category;
    if (area) where.areaId = area;
    if (favorite) {
        include.push({
            model: UserFavorite,
            as: 'favorites',
            where: { userId: favorite },
            attributes: []
        });
    }
    if (ingredient) {
        include.push({
            model: Ingredient,
            as: "ingredients",
            where: ingredient ? { id: ingredient } : undefined,
            attributes: ['id', 'name'],
            through: { attributes: [] }
        });
    }
    if (currentUserId) {
        include.push({
            model: UserFavorite,
            as: 'favorites',
            attributes: ['userId'],
            where: { userId: currentUserId },
            required: false
        });
    }
    const _limit = Number(limit) > 0 ? Number(limit) : 20;
    const _page = Number(page) > 1 ? Number(page) : 1;
    const offset = (_page - 1) * _limit;
    const recipes = await Recipe.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt', 'instructions'] },
        where,
        include,
        limit: _limit, offset, distinct: true});
    recipes.forEach(recipe => {
        recipe.setDataValue('ownerName', recipe.User?.name || null);
        recipe.setDataValue('ownerAvatar', recipe.User?.avatar || null);
        recipe.setDataValue('isFavorite', currentUserId ? (recipe.favorites?.length > 0) : false);
        delete recipe.dataValues.ingredients;
        delete recipe.dataValues.User;
        delete recipe.dataValues.favorites;
    });
    return recipes;
}

export async function getRecipe(query) {
    const recipe = await Recipe.findOne({
        where: query,
        include: [
            { model: Ingredient, as: 'ingredients', through: { attributes: ['measure'] } },
            { model: User, attributes: ['id', 'name', 'avatar'] },
            { model: Area, attributes: ['id', 'name'] },
            { model: Category, attributes: ['id', 'name'] },
        ],
    });
    if (!recipe) {
        throw HttpError(404, 'Recipe not found');
    }
    const transformedRecipe = {
        ...recipe.toJSON(),
        ingredients: recipe.ingredients.map(ingredient => ({
            id: ingredient.id,
            name: ingredient.name,
            desc: ingredient.desc,
            img: ingredient.img,
            measure: ingredient.RecipeIngredient?.measure || null
        })) || [],
        area: recipe.Area?.name || null,
        category: recipe.Category?.name || null,
        ownerName: recipe.User?.name || null,
        ownerAvatar: recipe.User?.avatar || null
    };
    delete transformedRecipe.Area;
    delete transformedRecipe.Category;
    delete transformedRecipe.User;
    return transformedRecipe;
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
    return recipe.update(data, { returning: true });
}

export async function getPopularRecipes(limit = 10, currentUserId) {
    const include = [{ model: User, attributes: ['id', 'name', 'avatar'] }];
    if (currentUserId) {
        include.push({
            model: UserFavorite,
            as: 'favorites',
            attributes: ['userId'],
            where: { userId: currentUserId },
            required: false
        });
    }
    const recipes = await Recipe.findAll({
        attributes: {
            include: [
                [Sequelize.literal(`(SELECT COUNT(*) FROM "UserFavorites" AS "fav" WHERE "fav"."recipeId" = "Recipe"."id")`), 'favoritesCount']
            ],
            exclude: ['createdAt', 'updatedAt', 'instructions']
        },

        include,
        order: [[Sequelize.literal('"favoritesCount"'), 'DESC']],
        limit
    });
    recipes.forEach(recipe => {
        recipe.setDataValue('ownerName', recipe.User?.name || null);
        recipe.setDataValue('ownerAvatar', recipe.User?.avatar || null);
        recipe.setDataValue('isFavorite', currentUserId ? (recipe.favorites?.length > 0) : false);
        recipe.setDataValue('favoritesCount', Number(recipe.getDataValue('favoritesCount')));
        delete recipe.dataValues.User;
        delete recipe.dataValues.favorites;
    });
    return recipes;
}

export async function updateFavoriteStatus(userId, recipeId, favorite) {
    const exists = await UserFavorite.findOne({ where: { userId, recipeId } });

    if (favorite) {
        if (!exists) {
            await UserFavorite.create({ userId, recipeId });
        }
    } else {
        if (exists) {
            await UserFavorite.destroy({ where: { userId, recipeId } });
        }
    }

    return { recipeId, favorite };
}
