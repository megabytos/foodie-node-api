import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../db/models/User.js';
import HttpError from '../helpers/HttpError.js';
import { nanoid } from 'nanoid';
import saveToCloudinary from '../helpers/saveToCloudinary.js';

const { JWT_SECRET } = process.env;

export async function getUserById(userId) {
    return await User.findByPk(userId);
}

export async function getUser(query) {
    return await User.findOne({ where: query });
}

export async function addUser(data) {
    const { email, password } = data;
    if (!email) {
        throw HttpError(400, `Email is empty`);
    }
    const existedUser = await getUser({ email });
    if (existedUser) {
        throw HttpError(409, `Email in use`);
    }
    const avatarURL = '';
    const hashedPassword = password && (await bcrypt.hash(password, 10));
    const verificationToken = nanoid();
    const newUser = await User.create({ ...data, password: hashedPassword, avatarURL, verificationToken });
    const token = jwt.sign({ id: newUser.id, email }, JWT_SECRET, { expiresIn: '24h' });
    await newUser.update({ token }, { returning: true });
    return { user: { name: newUser.name, email: newUser.email, avatarURL: newUser.avatar }, token };
}

export async function loginUser(data) {
    const { email, password } = data;
    const user = await getUser({ email });
    if (!user) {
        throw HttpError(401, 'Email or password is wrong');
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        throw HttpError(401, 'Email or password is wrong');
    }
    const token = jwt.sign({ id: user.id, email }, JWT_SECRET, { expiresIn: '24h' });
    await user.update({ token }, { returning: true });
    return {
        user: {
            name: user.name,
            email: user.email,
            avatarURL: user.avatar,
        },
        token,
    };
}

export async function logoutUser(userId) {
    const user = await getUserById(userId);
    if (!user) {
        throw HttpError(401, 'Not authorized');
    }
    return await user.update({ token: null }, { returning: true });
}

export async function updateUser(userId, data) {
    const user = await getUserById(userId);
    return user.update(data, { returning: true });
}

export async function updateAvatar(id, file, folderName) {
    if (!file) {
        throw HttpError(400, 'No attached file');
    }
    const user = await getUser({ id });
    if (!user) throw HttpError(401, 'Not authorized');
    try {
        const avatar = await saveToCloudinary(file, folderName);
        await user.update({ avatar }, { returning: true });
        return { avatarURL: user.avatar };
    } catch (error) {
        throw HttpError(500, 'Error during the saving user avatar in DB:');
    }
}
