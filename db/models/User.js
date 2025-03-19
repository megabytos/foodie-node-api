import { DataTypes } from 'sequelize';
import sequelize from '../sequelize.js';
import { emailRegexp } from '../../constants/regexp.js';
import { nanoid } from 'nanoid';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.STRING(24),
        defaultValue: () => nanoid(),
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { msg: 'Email is already in use' },
        validate: {
            is: emailRegexp,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '',
        validate: {
            notNull: {
                msg: 'Password must exist',
            },
            notEmpty: {
                msg: 'Password cannot be empty',
            },
        },
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    avatar: {
        type: DataTypes.STRING,
        defaultValue: null,
    },
    token: {
        type: DataTypes.STRING,
        defaultValue: null,
    },
    verify: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    verificationToken: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'users',
    indexes: [
        { unique: true, fields: ['email'] },
    ],
});

//User.sync({alter: true });

export default User;


