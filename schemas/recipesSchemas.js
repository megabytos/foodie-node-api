import Joi from 'joi';

export const createRecipeSchema = Joi.object({
    title: Joi.string().min(2).max(128).required(),
    time: Joi.number().required(),
    instructions: Joi.string(),
    description: Joi.string(),
    favorite: Joi.boolean().default(false),
});

export const updateRecipeSchema = Joi.object({
    title: Joi.string().min(2).max(128),
    time: Joi.number(),
    instructions: Joi.string(),
    description: Joi.string(),
    favorite: Joi.boolean(),
}).or('title', 'time', 'instructions', 'description').messages({ 'object.missing': `Body must have at least one field` });

export const updateStatusRecipeSchema = Joi.object({
    favorite: Joi.boolean().required(),
});