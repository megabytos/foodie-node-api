import { Ingredient, Category, Area, Testimonial, User } from '../db/models/index.js';

import { col } from 'sequelize';

export const listCategories = async () => await Category.findAll();

export const listAreas = async () => await Area.findAll();

export const listIngredients = async () => await Ingredient.findAll();

export const listTestimonials = async () =>
  await Testimonial.findAll({
    attributes: {
      include: [[col('user.name'), 'userName']],
    },
    include: [
      {
        model: User,
        as: 'user',
        attributes: [], 
      },
    ],
    raw: true,
  });