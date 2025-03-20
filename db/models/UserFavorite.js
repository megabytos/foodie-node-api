import { DataTypes } from 'sequelize';
import sequelize from '../sequelize.js';

const UserFavorite = sequelize.define('UserFavorite', {
    userId: {
        type: DataTypes.STRING(24),
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
    },
    recipeId: {
        type: DataTypes.STRING(24),
        allowNull: false,
        references: { model: 'Recipes', key: 'id' },
        onDelete: 'CASCADE',
    },
}, {
    tableName: 'UserFavorites',
    indexes: [
        { unique: true, fields: ['userId', 'recipeId'] },
        { fields: ['userId'] },
        { fields: ['recipeId'] },
    ],
});

export default UserFavorite;
