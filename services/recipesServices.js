import Recipe from '../db/models/Recipe.js';
import HttpError from '../helpers/HttpError.js';
import sequelize from '../db/sequelize.js';
import { Ingredient, Area, Category, User, UserFavorite, RecipeIngredient } from '../db/models/index.js';

export async function listRecipes({ owner, page, limit, favorite, category, ingredient, area }) {
    const where = {};
    const include = [{ model: User, attributes: ['id', 'name', 'avatar'] }];
    if (owner !== undefined) {
        where.ownerId = owner;
    }
    if (category !== undefined) {
        where.categoryId = category;
    }
    if (area !== undefined) {
        where.areaId = area;
    }
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
    const _limit = Number(limit) > 0 ? Number(limit) : 20;
    const _page = Number(page) > 1 ? Number(page) : 1;
    const offset = (_page - 1) * _limit;
    const recipes = await Recipe.findAll({ where, include, limit: _limit, offset, distinct: true});
    recipes.forEach(recipe => {
        recipe.setDataValue('ownerName', recipe.User?.name || null);
        recipe.setDataValue('ownerAvatar', recipe.User?.avatar || null);
        delete recipe.dataValues.ingredients;
        delete recipe.dataValues.User;
    });
    return recipes;
}

export async function getRecipe(query) {
    const recipe = await Recipe.findOne({
        where: query,
        include: [
            { model: Ingredient, through: { attributes: ['measure'] } },
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
        Ingredients: recipe.Ingredients.map(ingredient => ({
            id: ingredient.id,
            name: ingredient.name,
            desc: ingredient.desc,
            img: ingredient.img,
            measure: ingredient.RecipeIngredient?.measure || null
        })),
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

export async function getPopularRecipes(activeUserId, limit = 10) {
    const recipes = await Recipe.findAll({
        attributes: [
            'id',
            ['title', 'recipeName'],
            ['description', 'recipeDescription'],
            [sequelize.literal('(SELECT COUNT(*) FROM "UserFavorites" WHERE "UserFavorites"."recipeId" = "Recipe"."id")'), 'favoriteCount'],
        ],
        include: [
            {
                model: User,
                attributes: [
                    ['name', 'recipeUserName'],
                    ['avatar', 'recipeUserAvatar'],
                ],
            },
        ],
        order: [[sequelize.literal('"favoriteCount"'), 'DESC']],
        limit,
    });

    const favoriteStatuses = await UserFavorite.findAll({
        attributes: ['recipeId'],
        where: { userId: activeUserId },
    });

    const favoriteRecipeIds = new Set(favoriteStatuses.map(fav => fav.recipeId));

    return recipes.map(recipe => ({
        recipeId: recipe.id,
        recipeName: recipe.get('recipeName'),
        recipeDescription: recipe.get('recipeDescription'),
        recipeUserName: recipe.User.get('recipeUserName'),
        recipeUserAvatar: recipe.User.get('recipeUserAvatar'),
        recipeLikeStatus: favoriteRecipeIds.has(recipe.id),
    }));
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
