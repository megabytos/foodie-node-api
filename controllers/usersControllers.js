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

export const userCurrentFullController = async (req, res) => { };

export const updateUserAvatarController = async (req, res) => {
    const { id } = req.user;
    const data = await service.updateAvatar(id, req.file, 'avatars');
    res.status(200).json({
        message: 'Avatar has changed successfully',
        data,
    });
};

export const followUserController = async (req, res) => {
    const { id: curentUser } = req.user;
    const { id: userToFollow } = req.params;
    const data = await service.followUser(curentUser, userToFollow);
    res.status(200).json({
        message: 'User followed successfully',
        data,
    });
}

export const unfollowUserController = async (req, res) => {
    const { id: curentUser } = req.user;
    const { id: userToUnfollow } = req.params;
    const data = await service.unfollowUser(curentUser, userToUnfollow);
    res.status(200).json({
        message: 'User unfollowed successfully',
        data,
    });
}

export const followersController = async (req, res) => {
    const { id } = req.params;
    const data = await service.getFollowers(id);
    res.status(200).json({ data });
}

export const followingController = async (req, res) => {
    const { id } = req.user;
    const data = await service.getFollowedUsers(id);
    res.status(200).json({ data });
}
