import jwt from "jsonwebtoken";
import HttpError from "../helpers/HttpError.js";
import {getUserById} from "../services/usersServices.js";
const { JWT_SECRET } = process.env;

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

export const verifyToken = (token) => {
    try {
        const data = jwt.verify(token, JWT_SECRET);
        return { data };
    } catch (error) {
        return { error };
    }
};

export const getCurrentUserData = (req) => {
    if (req.user) return req.user;
    const { authorization } = req.headers;
    if (!authorization) return null;
    const [bearer, token] = authorization.split(" ");
    if (!token) return null;
    const { data, error } = verifyToken(token);
    return data;
}

export default auth;