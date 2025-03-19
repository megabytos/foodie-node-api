import { DataTypes } from 'sequelize';
import sequelize from '../sequelize.js';
import { nanoid } from 'nanoid';

const Testimonial = sequelize.define('Testimonial', {
    id: {
        type: DataTypes.STRING(24),
        defaultValue: () => nanoid(),
        primaryKey: true
    },
    userId: {
        type: DataTypes.STRING(24),
        allowNull: false,
        references: { model: 'Users', key: 'id' }
    },
    testimonial: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

export default Testimonial;
