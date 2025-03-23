import { OAuth2Client } from 'google-auth-library';
import HttpError from './HttpError.js';

const { GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REDIRECT_URI } = process.env;

const googleOAuthClient = new OAuth2Client({
    clientId: GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: GOOGLE_OAUTH_CLIENT_SECRET,
    redirectUri: GOOGLE_OAUTH_REDIRECT_URI,
});

export const generateAuthUrl = () => {
    return googleOAuthClient.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
    });
};

export const validateCode = async code => {
    try {
        const response = await googleOAuthClient.getToken(code);
        if (!response.tokens.id_token) throw createHttpError(401, 'Not authorized');

        const ticket = await googleOAuthClient.verifyIdToken({
            idToken: response.tokens.id_token,
        });
        return ticket;
    } catch (error) {
        if (error.status === 400) {
            throw HttpError(error.status, 'Token is invalid');
        }
    }
};

export const getNameFromGoogleTokenPayload = payload => {
    let name = 'Guest';
    if (payload.given_name) {
        name = payload.given_name;
    }
    return name;
};
