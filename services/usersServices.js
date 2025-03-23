import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../db/models/User.js';
import UserFollower from '../db/models/UserFollower.js';
import Recipe from '../db/models/Recipe.js';
import HttpError from '../helpers/HttpError.js';
import { nanoid } from 'nanoid';
import saveToCloudinary from '../helpers/saveToCloudinary.js';
import sequelize from '../db/sequelize.js';
import calculatePaginationData from '../helpers/paginatoin/calculatePaginationData.js';

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
    return { user: { id: newUser.id, name: newUser.name, email: newUser.email, avatarURL: newUser.avatar }, token };
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
            id: user.id,
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

export const userFullDetails = async (userId, loggedInUserId) => {
    if (!userId || userId === ':id') throw HttpError(400, 'Missing user id parameter');
    const user = await User.findByPk(userId, {
        attributes: [
            'id',
            'name',
            'email',
            'avatar',
            [sequelize.literal(`(SELECT COUNT(*) FROM "Recipes" WHERE "Recipes"."ownerId" = "User"."id")`), 'totalRecipes'],

            [sequelize.literal(`(SELECT COUNT(*) FROM "UserFollowers" WHERE "UserFollowers"."userId" = "User"."id")`), 'totalFollowers'],

            ...(userId === loggedInUserId
                ? [[sequelize.literal(`(SELECT COUNT(*) FROM "UserFollowers" WHERE "UserFollowers"."followerId" = "User"."id")`), 'totalFollowing']]
                : []),
            ...(userId === loggedInUserId
                ? [[sequelize.literal(`(SELECT COUNT(*) FROM "UserFavorites" WHERE "UserFavorites"."userId" = "User"."id")`), 'totalFavoriteRecipes']]
                : []),
        ],
    });

    if (!user) throw HttpError(404, 'User not found');
    return user;
};

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
        return { id: user.id, avatarURL: user.avatar };
    } catch (error) {
        throw HttpError(500, 'Error during the saving user avatar in DB:');
    }
}

export async function followUser(curentUser, userToFollow) {
    if (curentUser === userToFollow) {
        throw HttpError(400, 'You cannot follow yourself');
    }
    const user = await getUserById(userToFollow);
    if (!user) {
        throw HttpError(404, 'User not found');
    }
    const follower = await UserFollower.findOne({ where: { userId: userToFollow, followerId: curentUser } });
    if (follower) {
        throw HttpError(409, 'You already follow this user');
    }
    return await UserFollower.create({ userId: userToFollow, followerId: curentUser });
}

export async function unfollowUser(curentUser, userToUnfollow) {
    if (curentUser === userToUnfollow) {
        throw HttpError(400, 'You cannot unfollow yourself');
    }
    const user = await getUserById(userToUnfollow);
    if (!user) {
        throw HttpError(404, 'User not found');
    }
    const follower = await UserFollower.findOne({ where: { userId: userToUnfollow, followerId: curentUser } });
    if (!follower) {
        throw HttpError(409, 'You are not following this user');
    }
    return await follower.destroy();
}

export async function getFollowData({
    id,
    queryField,
    alias,
    resKey,
    page = defaultPagination.page,
    limit = defaultPagination.limit,
    recipeLimit = defaultPagination.recipeLimit,
}) {
    const user = await getUserById(id);
    if (!user) {
        throw HttpError(404, 'User not found');
    }
    const offset = (page - 1) * limit;
    const { count, rows: data } = await UserFollower.findAndCountAll({
        where: {
            [queryField]: id,
        },
        attributes: [],
        include: [
            {
                model: User,
                as: alias,
                attributes: [
                    'id',
                    'name',
                    'avatar',
                    [sequelize.literal(`(SELECT COUNT(*) FROM "Recipes" WHERE "Recipes"."ownerId" = "${alias}"."id")`), 'totalRecipes'],
                ],
                include: [
                    {
                        model: Recipe,
                        as: 'ownedRecipes',
                        attributes: ['id', 'thumb'],
                        limit: recipeLimit,
                    },
                ],
            },
        ],
        limit,
        offset,
        order: [[{ model: User, as: alias }, 'id', 'ASC']],
        distinct: true,
    });
    const paginationData = calculatePaginationData(count, page, limit);
    if (page > paginationData.totalPage || page < 1) {
        throw HttpError(400, 'Page is out of range');
    }
    const formattedData = data?.map(item => item[alias]);
    return formattedData.length > 0 ? { [resKey]: formattedData, ...paginationData } : { [resKey]: formattedData };
}

export async function getFollowers({ id, page = defaultPagination.page, limit = defaultPagination.limit, recipeLimit = defaultPagination.recipeLimit }) {
    return getFollowData({
        id,
        page,
        limit,
        recipeLimit,
        queryField: 'userId',
        alias: 'Follower',
        resKey: 'followers'
    });
}

export async function getFollowedUsers({ id, page = defaultPagination.page, limit = defaultPagination.limit, recipeLimit = defaultPagination.recipeLimit }) {
    return getFollowData({
        id,
        page,
        limit,
        recipeLimit,
        queryField: 'followerId',
        alias: 'User',
        resKey: 'following',
    });
}
