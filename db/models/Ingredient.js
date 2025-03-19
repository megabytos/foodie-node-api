import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";
import { nanoid } from 'nanoid';

const Ingredient = sequelize.define('Ingredient', {
    id: {
        type: DataTypes.STRING(24),
        defaultValue: () => nanoid(),
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    desc: {
        type: DataTypes.TEXT
    },
    img: {
        type: DataTypes.STRING
    }
});

export default Ingredient;
