import * as service from '../services/usersServices.js';

export const userRegisterController = async (req, res) => {
    const data = await service.addUser(req.body);
    res.status(201).json({
        message: 'Signup successfully',
        data,
    });
};

export const userLoginController = async (req, res) => {
    const data = await service.loginUser(req.body);
    res.status(200).json({
        message: 'User successfully log in',
        data,
    });
};

export const userLogoutController = async (req, res) => {
    await service.logoutUser(req.user.id);
    res.status(204).send();
};

export const userCurrentController = async (req, res) => {
    const { email, name, token, avatar } = req.user;
    res.status(200).json({
        message: 'User info found successfully',
        data: { user: { email, name, avatarURL: avatar }, token },
    });
};

export const userCurrentFullController = async (req, res) => {};

export const updateUserAvatarController = async (req, res) => {
    const { id } = req.user;
    const data = await service.updateAvatar(id, req.file, 'avatars');
    res.status(200).json({
        message: 'Avatar has changed successfully',
        data,
    });
};
