import { readdirSync } from 'fs';
import { join, resolve } from 'path';
import sequelize from '../sequelize.js';
import Sequelize, { DataTypes, Model } from 'sequelize';

// 🔹 Определяем путь к папке моделей без `__dirname`
const modelsPath = resolve(process.cwd(), "db", "models");

// 🔹 Объект для хранения моделей
const db = {};

// 🔹 Загружаем все файлы моделей динамически
const modelFiles = readdirSync(modelsPath)
    .filter(file => file.endsWith('.js') && file !== 'index.js');

for (const file of modelFiles) {
    const modelModule = await import(`file://${join(modelsPath, file)}`);
    const model = modelModule.default;

    if (model.prototype instanceof Model) {
        // Если это класс, расширяющий Model
        model.init(model.getAttributes(DataTypes), { sequelize, modelName: model.name });
        db[model.name] = model;
    } else {
        // Если это sequelize.define()
        db[model.name] = model;
    }
}

// 🔹 Устанавливаем связи между моделями
Object.values(db).forEach(model => {
    if (typeof model.associate === 'function') {
        model.associate(db);
    }
});

// Определение связей между моделями
const { Recipe, Ingredient, Category, Area, RecipeIngredient, User, Testimonial, UserFavorite, UserFollower } = db;

Recipe.belongsTo(Category, { foreignKey: 'categoryId', onDelete: 'CASCADE' });
Recipe.belongsTo(User, { foreignKey: 'ownerId', onDelete: 'CASCADE' });
Recipe.belongsTo(Area, { foreignKey: 'areaId', onDelete: 'CASCADE' });

Recipe.belongsToMany(Ingredient, { through: RecipeIngredient, foreignKey: 'recipeId', onDelete: 'CASCADE' });
Ingredient.belongsToMany(Recipe, { through: RecipeIngredient, foreignKey: 'ingredientId', onDelete: 'CASCADE' });

User.hasMany(Testimonial, { foreignKey: 'userId', onDelete: 'CASCADE' });

User.belongsToMany(Recipe, { through: UserFavorite, foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Recipe, { foreignKey: 'ownerId', as: 'ownedRecipes', onDelete: 'CASCADE' });

User.belongsToMany(User, { as: 'Followers', through: UserFollower, foreignKey: 'userId', onDelete: 'CASCADE' });
User.belongsToMany(User, { as: 'Following', through: UserFollower, foreignKey: 'followerId', onDelete: 'CASCADE' });
UserFollower.belongsTo(User, { foreignKey: 'followerId', as: 'Follower' });
UserFollower.belongsTo(User, { foreignKey: 'userId', as: 'User' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Экспортируем объект с моделями и sequelize
export { sequelize, Recipe, Ingredient, Category, Area, RecipeIngredient, User, Testimonial, UserFavorite, UserFollower };
export default db;