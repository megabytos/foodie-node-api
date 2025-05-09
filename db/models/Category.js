import { DataTypes } from 'sequelize';
import sequelize from '../sequelize.js';
import { nanoid } from 'nanoid';

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.STRING(24),
        defaultValue: () => nanoid(),
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    srcSet: {
        type: DataTypes.JSON,
    },
    description : {
        type: DataTypes.STRING,
    }
});

export default Category;