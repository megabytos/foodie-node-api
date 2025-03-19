import { DataTypes } from 'sequelize';
import { nanoid } from 'nanoid';
import sequelize from '../sequelize.js';

const Area = sequelize.define('Area', {
    id: {
        type: DataTypes.STRING(24),
        defaultValue: () => nanoid(),
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

export default Area;