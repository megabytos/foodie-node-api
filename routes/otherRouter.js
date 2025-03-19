import express from 'express';
import controllerWrapper from '../helpers/controllerWrapper.js';
import { getAllAreas, getAllCategories, getAllIngredients, getAllTestimonials } from '../controllers/otherControllers.js';

const otherRouter = express.Router();

otherRouter.get('/categories', controllerWrapper(getAllCategories));

otherRouter.get('/areas', controllerWrapper(getAllAreas));

otherRouter.get('/ingredients', controllerWrapper(getAllIngredients));

otherRouter.get('/testimonials', controllerWrapper(getAllTestimonials));

export default otherRouter;