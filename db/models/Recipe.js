import { DataTypes } from 'sequelize';
import sequelize from '../sequelize.js';
import { nanoid } from 'nanoid';

const Recipe = sequelize.define('Recipe', {
    id: {
        type: DataTypes.STRING(24),
        defaultValue: () => nanoid(),
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    categoryId: {
        type: DataTypes.STRING(24),
        allowNull: false,
        references: { model: 'Categories', key: 'id' },
        onDelete: 'CASCADE'
    },
    ownerId: {
        type: DataTypes.STRING(24),
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE'
    },
    areaId: {
        type: DataTypes.STRING(24),
        allowNull: false,
        references: { model: 'Areas', key: 'id' },
        onDelete: 'CASCADE'
    },
    instructions: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    time: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    thumb: {
        type: DataTypes.STRING,
    },
}, {
    tableName: 'recipes',
    indexes: [
        { fields: ['categoryId'] },
        { fields: ['areaId'] },
        { fields: ['ownerId'] }
    ]
});

export default Recipe;