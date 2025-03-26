import Recipe from '../db/models/Recipe.js';
import HttpError from '../helpers/HttpError.js';
import sequelize from '../db/sequelize.js';
import { Sequelize } from 'sequelize';

import { Ingredient, Area, Category, User, UserFavorite, RecipeIngredient } from '../db/models/index.js';
import calculatePaginationData from '../helpers/paginatoin/calculatePaginationData.js';
import saveToCloudinary from '../helpers/saveToCloudinary.js';
import { getUserById } from './usersServices.js';

export async function listRecipes({ page, limit, favorite, category, ingredient, area, owner, currentUserId }) {
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
            attributes: [],
        });
    }
    if (ingredient) {
        include.push({
            model: Ingredient,
            as: 'ingredients',
            where: ingredient ? { id: ingredient } : undefined,
            attributes: ['id', 'name'],
            through: { attributes: [] },
        });
    }
    if (currentUserId) {
        include.push({
            model: UserFavorite,
            as: 'favorites',
            attributes: ['userId'],
            where: { userId: currentUserId },
            required: false,
        });
    }
    const _limit = Number(limit) > 0 ? Number(limit) : 20;
    const _page = Number(page) > 1 ? Number(page) : 1;
    const offset = (_page - 1) * _limit;

    const { count: total, rows: recipes } = await Recipe.findAndCountAll({
        attributes: { exclude: ['createdAt', 'updatedAt', 'instructions'] },
        where,
        include,
        limit: _limit,
        offset,
        distinct: true,
    });
    recipes.forEach(recipe => {
        recipe.setDataValue('ownerName', recipe.User?.name || null);
        recipe.setDataValue('ownerAvatar', recipe.User?.avatar || null);
        recipe.setDataValue('isFavorite', currentUserId ? recipe.favorites?.length > 0 : false);
        delete recipe.dataValues.ingredients;
        delete recipe.dataValues.User;
        delete recipe.dataValues.favorites;
    });
    const paginationData = calculatePaginationData(total, _page, _limit);
    if (page > paginationData.totalPage || page < 1) {
        throw HttpError(400, 'Page is out of range');
    }
    return recipes?.length > 0 ? { recipes, ...paginationData } : { recipes };
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
        ingredients:
            recipe.ingredients.map(ingredient => ({
                id: ingredient.id,
                name: ingredient.name,
                desc: ingredient.desc,
                img: ingredient.img,
                measure: ingredient.RecipeIngredient?.measure || null,
            })) || [],
        area: recipe.Area?.name || null,
        category: recipe.Category?.name || null,
        ownerName: recipe.User?.name || null,
        ownerAvatar: recipe.User?.avatar || null,
    };
    delete transformedRecipe.Area;
    delete transformedRecipe.Category;
    delete transformedRecipe.User;
    return transformedRecipe;
}

export async function removeRecipe(query) {
    const user = await getUserById(query.ownerId);
    if (!user) {
        throw HttpError(404, 'User not found');
    }
    const recipe = await Recipe.findOne({ where: query });
    if (!recipe) throw HttpError(400, 'Recipe not found!');
    const recipeData = recipe.get({ plain: true });
    await recipe.destroy();
    return recipeData;
}

export async function addRecipe(data) {
    const {
        body: { ingredients: ingredientsString, categoryId, areaId = '6462a6f04c3d0ddd28897f9e', ...recipeData },
        file,
        ownerId,
    } = data;
    let thumb = null;
    if (file) {
        try {
            thumb = await saveToCloudinary(file, 'recipe');
        } catch (error) {
            throw HttpError(500, 'Error saving recipe photo: ' + error.message);
        }
    }
    let ingredients = [];
    try {
        ingredients = JSON.parse(ingredientsString);
        if (!Array.isArray(ingredients)) {
            throw new Error('Ingredients must be an array');
        }
    } catch (error) {
        throw HttpError(400, 'Invalid ingredients format: ' + error.message);
    }
    const transaction = await sequelize.transaction();
    try {
        const newRecipe = await Recipe.create(
            {
                ...recipeData,
                categoryId,
                areaId,
                thumb,
                ownerId,
            },
            { transaction }
        );

        if (ingredients.length > 0) {
            const ingredientForAdding = ingredients.map(({ ingredientId, measure }) => ({
                recipeId: newRecipe.id,
                ingredientId,
                measure,
            }));
            await RecipeIngredient.bulkCreate(ingredientForAdding, { transaction });
        }

        await transaction.commit();

        const recipeWithIngredients = await Recipe.findByPk(newRecipe.id, {
            attributes: ['id', 'title', 'categoryId', 'ownerId', 'areaId', 'instructions', 'description', 'time', 'thumb'],
            include: [
                {
                    model: Ingredient,
                    as: 'ingredients',
                    attributes: ['id', 'name', 'img'],
                    through: { attributes: ['measure'] },
                },
            ],
        });

        const formattedResult = {
            ...recipeWithIngredients.get({ plain: true }),
            ingredients: recipeWithIngredients.ingredients.map(ingredient => ({
                id: ingredient.id,
                name: ingredient.name,
                img: ingredient.img,
                measure: ingredient.RecipeIngredient.measure,
            })),
        };

        return formattedResult;
    } catch (error) {
        await transaction.rollback();
        throw HttpError(400, 'Recipe creation failed: ' + error.message);
    }
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
            required: false,
        });
    }
    const recipes = await Recipe.findAll({
        attributes: {
            include: [[Sequelize.literal(`(SELECT COUNT(*) FROM "UserFavorites" AS "fav" WHERE "fav"."recipeId" = "Recipe"."id")`), 'favoritesCount']],
            exclude: ['createdAt', 'updatedAt', 'instructions'],
        },

        include,
        order: [[Sequelize.literal('"favoritesCount"'), 'DESC']],
        limit,
    });
    recipes.forEach(recipe => {
        recipe.setDataValue('ownerName', recipe.User?.name || null);
        recipe.setDataValue('ownerAvatar', recipe.User?.avatar || null);
        recipe.setDataValue('isFavorite', currentUserId ? recipe.favorites?.length > 0 : false);
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

export async function getUserOwnRecipes({ ownerId, page = 1, limit = 10, currentUserId = null }) {
    const _limit = Number(limit) > 0 ? Number(limit) : 20;
    const _page = Number(page) > 1 ? Number(page) : 1;
    const offset = (_page - 1) * _limit;
    const queryOptions = {
        where: { ownerId },
        attributes: ['id', 'title', 'description', 'time', 'thumb', 'createdAt'],
        include: [
            {
                model: User,
                as: 'User',
                attributes: ['name', 'avatar'],
            },
            {
                model: Ingredient,
                as: 'ingredients',
                attributes: ['id', 'name', 'img'],
                through: { attributes: ['measure'] },
            },
        ],
        order: [['createdAt', 'DESC']],
        limit: _limit,
        offset,
        distinct: true,
    };
    if (currentUserId) {
        queryOptions.include.push({
            model: UserFavorite,
            as: 'favorites',
            where: { userId: currentUserId },
            required: false,
            attributes: [],
        });
    }
    const { count, rows: recipes } = await Recipe.findAndCountAll(queryOptions);
    const formattedRecipes = recipes.map(recipe => {
        const recipeData = recipe.get({ plain: true });
        return {
            id: recipeData.id,
            title: recipeData.title,
            description: recipeData.description,
            time: recipeData.time,
            thumb: recipeData.thumb,
            createdAt: recipeData.createdAt,
            ownerName: recipe.User?.name,
            ownerAvatar: recipe.User?.avatar,
            ingredients: recipeData.ingredients.map(ing => ({
                id: ing.id,
                name: ing.name,
                img: ing.img,
                measure: ing.RecipeIngredient.measure,
            })),
            ...(currentUserId && {
                isFavorite: recipeData.favorites?.length > 0,
            }),
        };
    });

    const paginationData = calculatePaginationData(count, page, limit);
    if (page > paginationData.totalPage || page < 1) {
        throw HttpError(400, 'Page is out of range');
    }
    return formattedRecipes?.length > 0 ? { recipes: formattedRecipes, ...paginationData } : { recipes: formattedRecipes };
}
