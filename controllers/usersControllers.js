import {addUser, loginUser, logoutUser, resendVerificationEmail, updateAvatar, updateUser, verifyUser} from "../services/usersServices.js";

export const register = async (req, res) => {
    const {email, subscription} = await addUser(req.body);
    res.status(201).json({user: {email, subscription}});
}

export const login = async (req, res) => {
    const {email, subscription, token} = await loginUser(req.body);
    res.status(200).json({
        token: token,
        user: {email, subscription},
    })
}

export const logout = async (req, res) => {
    await logoutUser(req.user.id);
    res.status(204).send();
}

export const current = async (req, res) => {
    const {email, subscription} = req.user;
    res.status(200).json({email, subscription});
}

export const avatar = async (req, res) => {
    const {id} = req.user;
    const {avatarURL} = await updateAvatar(id, req.file);
    res.status(200).json({avatarURL});
}

export const verify = async (req, res) => {
    const {verificationToken} = req.params;
    const {message} = await verifyUser(verificationToken);
    res.status(200).json({message});
}

export const resend = async (req, res) => {
    const {email} = req.body;
    const {message} = await resendVerificationEmail(email);
    res.status(200).json({message});
}
