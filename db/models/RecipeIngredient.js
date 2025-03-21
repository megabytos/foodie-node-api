import { DataTypes } from 'sequelize';
import sequelize from '../sequelize.js';

const RecipeIngredient = sequelize.define('RecipeIngredient', {
    recipeId: {
        type: DataTypes.STRING(24),
        allowNull: false,
        references: { model: 'Recipes', key: 'id' },
        onDelete: 'CASCADE',
    },
    ingredientId: {
        type: DataTypes.STRING(24),
        allowNull: false,
        references: { model: 'Ingredients', key: 'id' },
        onDelete: 'CASCADE',
    },
    measure: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'RecipeIngredients',
    indexes: [
        { unique: true, fields: ['recipeId', 'ingredientId'] },
        { fields: ['recipeId'] },
        { fields: ['ingredientId'] },
    ],
});

export default RecipeIngredient;
