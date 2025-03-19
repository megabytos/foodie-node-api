import * as service from '../services/usersServices.js';

export const userRegisterController = async (req, res) => {
    const result = await service.addUser(req.body);
    res.status(201).json({
        status: 201,
        message: 'Signup successfully',
        data: result,
    });
};

export const userLoginController = async (req, res) => {
    const result = await service.loginUser(req.body);
    res.status(200).json({
        status: 200,
        message: 'User successfully log in',
        data: result,
    });
};

export const logout = async (req, res) => {
    await service.logoutUser(req.user.id);
    res.status(204).send();
};

export const current = async (req, res) => {
    const { email, subscription } = req.user;
    res.status(200).json({ email, subscription });
};

export const avatar = async (req, res) => {
    const { id } = req.user;
    const { avatarURL } = await service.updateAvatar(id, req.file);
    res.status(200).json({ avatarURL });
};

export const verify = async (req, res) => {
    const { verificationToken } = req.params;
    const { message } = await service.verifyUser(verificationToken);
    res.status(200).json({ message });
};

export const resend = async (req, res) => {
    const { email } = req.body;
    const { message } = await service.resendVerificationEmail(email);
    res.status(200).json({ message });
};
