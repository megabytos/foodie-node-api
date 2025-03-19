import { DataTypes } from 'sequelize';
import sequelize from '../sequelize.js';

const UserFollower = sequelize.define('UserFollower', {
    userId: {
        type: DataTypes.STRING(24),
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
    },
    followerId: {
        type: DataTypes.STRING(24),
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
    },
}, {
    tableName: 'user_followers',
    indexes: [
        { unique: true, fields: ['userId', 'followerId'] },
        { fields: ['userId'] },
        { fields: ['followerId'] },
    ],
});

export default UserFollower;
