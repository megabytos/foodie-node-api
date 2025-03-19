import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../db/models/User.js";
import HttpError from "../helpers/HttpError.js";
import path from "node:path";
import fs from "fs/promises";
import {avatarsDir, avatarsPath} from "../middlewares/upload.js";
import {sendVerificationEmail} from "../helpers/sendMail.js";
import {nanoid} from "nanoid";

const {JWT_SECRET} = process.env;

export async function getUserById(userId) {
    return await User.findByPk(userId);
}

export async function getUser(query) {
    return await User.findOne({where: query});
}

export async function addUser(data) {
    const {email, password} = data;
    if (!email) {
        throw HttpError(400, `Email is empty`);
    }
    const existedUser = await getUser({email});
    if (existedUser) {
        throw HttpError(409, `Email in use`);
    }
    const avatarURL = '';
    const hashedPassword = password && await bcrypt.hash(password, 10);
    const verificationToken = nanoid();
    const newUser = await User.create({...data, password: hashedPassword, avatarURL, verificationToken});
    await sendVerificationEmail(email, verificationToken);
    return newUser;
}

export async function loginUser(data) {
    const {email, password} = data;
    const user = await getUser({email});
    if (!user) {
        throw HttpError(401, "Email or password is wrong");
    }
    if (!user.verify) {
        throw HttpError(401, "Email is not verify");
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        throw HttpError(401, "Email or password is wrong");
    }
    const token = jwt.sign({id: user.id, email}, JWT_SECRET, {expiresIn: "24h"});
    return await user.update({token}, {returning: true});
}

export async function logoutUser(userId) {
    const user = await getUserById(userId);
    if (!user) {
        throw HttpError(401, "Not authorized");
    }
    return await user.update({token: null}, {returning: true});
}

export async function updateUser(userId, data) {
    const user = await getUserById(userId);
    return user.update(data, {returning: true});
}

export async function updateAvatar(userId, file) {
    if (!file) {
        throw HttpError(400, "No attached file");
    }
    const {path: tempPath, filename} = file;
    const newPath = path.join(avatarsPath, filename);
    const avatarPath = path.join(avatarsDir, filename);
    try {
        await fs.rename(tempPath, newPath);
    } catch (err) {
        await fs.unlink(tempPath);
        return HttpError(500, "File upload error");
    }
    return await updateUser(userId, {avatarURL: avatarPath});
}

export async function verifyUser(verificationToken) {
    const user = await getUser({verificationToken});
    if (!user) {
        throw HttpError(404, "User not found or already verified");
    }
    user.update({verificationToken: null, verify: true}, {returning: true});
    return {message: "Email verified successfully"};
}

export const resendVerificationEmail = async (email) => {
    const user = await getUser({email});
    if (!user || user.verify) {
        throw HttpError(400, "User not found or already verified");
    }
    await sendVerificationEmail(email, user.verificationToken);
    return {message: "Verification email sent"};
}