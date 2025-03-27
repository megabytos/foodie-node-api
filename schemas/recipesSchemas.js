import Joi from 'joi';

export const createRecipeSchema = Joi.object({
    title: Joi.string().min(2).max(128).required(),
    time: Joi.number().required(),
    instructions: Joi.string(),
    description: Joi.string(),
    favorite: Joi.boolean().default(false),
    categoryId: Joi.string().required(),
    ingredients: Joi.string()
        .custom((value, helpers) => {
            try {
                const parsed = JSON.parse(value);
                if (!Array.isArray(parsed)) {
                    return helpers.error('any.invalid');
                }
                const { error } = Joi.array()
                    .items(
                        Joi.object({
                            ingredientId: Joi.string().required(),
                            measure: Joi.string().required(),
                        })
                    )
                    .validate(parsed);
                if (error) throw error;
                return parsed;
            } catch (e) {
                return helpers.error('any.invalid');
            }
        }, 'JSON array validation')
        .required(),
});

export const updateRecipeSchema = Joi.object({
    title: Joi.string().min(2).max(128),
    time: Joi.number(),
    instructions: Joi.string(),
    description: Joi.string(),
    favorite: Joi.boolean(),
})
    .or('title', 'time', 'instructions', 'description')
    .messages({ 'object.missing': `Body must have at least one field` });

export const updateStatusRecipeSchema = Joi.object({
    favorite: Joi.boolean().required(),
});
