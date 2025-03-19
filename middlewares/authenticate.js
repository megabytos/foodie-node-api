import jwt from "jsonwebtoken";
import HttpError from "../helpers/HttpError.js";
import {getUserById} from "../services/usersServices.js";

const auth = async (req, res, next) => {
    const {authorization} = req.headers;
    if (!authorization) {
        return next(HttpError(401, "No authorization header"));
    }
    const [bearer, token] = authorization.split(" ");
    if (bearer !== "Bearer") {
        return next(HttpError(401, "Invalid authorization header"));
    }
    try {
        const {id} = jwt.verify(token, process.env.JWT_SECRET);
        const user = await getUserById(id);
        if (!user || user.token !== token) {
            return next(HttpError(401, "Not authorized"));
        }
        req.user = user;
    } catch (err) {
        return next(HttpError(err.status, err.message));
    }
    next();
}

export default auth;