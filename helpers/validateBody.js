import HttpError from "./HttpError.js";

const validateBody = (schema) => {
    return (req, _, next) => {
        const {error} = schema.validate(req.body, {abortEarly: false});
        if (error) {
            next(HttpError(400, error.message));
        }
        next();
    };
};

export default validateBody;
