import fs from "node:fs";
import * as path from "node:path";
import sequelize from './sequelize.js';
import  { Recipe, Ingredient, Category, Area, User, Testimonial, RecipeIngredient } from './models/index.js';

async function loadJSON(filename) {
    const filePath = path.join(process.cwd(), "db", 'data', filename);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function seedDatabase() {
    try {
        await sequelize.sync({ force: true });
        console.log('Tables have been created');
        console.log('Loading data...');

        const users = await loadJSON('users.json');
        await User.bulkCreate(users.map(user => ({
            id: user._id.$oid,
            name: user.name,
            avatar: user.avatar,
            email: user.email
        })));
        console.log('Users loaded.');

        const testimonials = await loadJSON('testimonials.json');
        await Testimonial.bulkCreate(testimonials.map(testimonial => ({
            id: testimonial._id.$oid,
            userId: testimonial.owner.$oid,
            testimonial: testimonial.testimonial
        })));
        console.log('Testimonials loaded.');

        const areas = await loadJSON('areas.json');
        await Area.bulkCreate(areas.map(area => ({
            id: area._id.$oid,
            name: area.name
        })));
        console.log('Areas loaded.');

        const categories = await loadJSON('categories.json');
        await Category.bulkCreate(categories.map(category => ({
            id: category._id.$oid,
            name: category.name
        })));
        console.log('Categories loaded.');

        const ingredients = await loadJSON('ingredients.json');
        await Ingredient.bulkCreate(ingredients.map(ingredient => ({
            id: ingredient._id,
            name: ingredient.name,
            desc: ingredient.desc,
            img: ingredient.img
        })));
        console.log('Ingredients loaded.');

        const categoriesMap = new Map(categories.map(c => [c.name, c._id.$oid]));
        const areasMap = new Map(areas.map(a => [a.name, a._id.$oid]));
        const ingredientsMap = new Map(ingredients.map(i => [i._id, i.name]));
        const recipesData = await loadJSON("recipes.json");
        for (let recipe of recipesData) {
            const categoryId = categoriesMap.get(recipe.category);
            const areaId = areasMap.get(recipe.area);

            if (!categoryId || !areaId) {
                console.warn(`Skip the recipe "${recipe.title}"`);
                continue;
            }

            const createdRecipe = await Recipe.create({
                id: recipe._id.$oid,
                title: recipe.title,
                categoryId,
                ownerId: recipe.owner.$oid,
                areaId,
                instructions: recipe.instructions,
                description: recipe.description,
                thumb: recipe.thumb,
                time: isNaN(parseInt(recipe.time)) ? 0 : parseInt(recipe.time)
            });

            const recipeIngredients = [];
            for (let ing of recipe.ingredients) {
                const ingredientId = ingredientsMap.get(ing.id);
                if (ingredientId) {
                    recipeIngredients.push({
                        recipeId: createdRecipe.id,
                        ingredientId: ing.id,
                        measure: ing.measure
                    });
                } else {
                    console.warn(`Skip the ingredient "${ing.name}" for the recipe "${recipe.title}"`);
                }
            }
            if (recipeIngredients.length > 0) {
                await RecipeIngredient.bulkCreate(recipeIngredients);
            }
        }
        console.log("Recipes loaded.");
        console.log('All data has been successfully loaded into the database.!');
    } catch (error) {
        console.error('Error loading data:', error);
    } finally {
        await sequelize.close();
    }
}

seedDatabase();
