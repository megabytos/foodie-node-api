import { Ingredient, Category, Area, Testimonial } from '../db/models/index.js';

export const listCategories = async () => await Category.findAll();

export const listAreas = async () => await Area.findAll();

export const listIngredients = async () => await Ingredient.findAll();

export const listTestimonials = async () => await Testimonial.findAll();
