import {ValidationError} from "sequelize";

const controllerWrapper = ctrl => {
    return async (req, res, next) => {
        try {
            await ctrl(req, res, next);
        } catch (error) {
            if (error instanceof ValidationError) {
                error.status = 400;
                if (error.name === "SequelizeUniqueConstraintError") {
                    error.status = 409;
                }
            }
            next(error)
        }
    };
}

export default controllerWrapper;