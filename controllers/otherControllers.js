import { listCategories, listAreas, listIngredients, listTestimonials } from '../services/otherServices.js';

export const getAllCategories = async (req, res) => {
    res.status(200).json(await listCategories());
};

export const getAllAreas = async (req, res) => {
    res.status(200).json(await listAreas());
};

export const getAllIngredients = async (req, res) => {
    res.status(200).json(await listIngredients());
};

export const getAllTestimonials = async (req, res) => {
    res.status(200).json(await listTestimonials());
};
