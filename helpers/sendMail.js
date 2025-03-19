import nodemailer from 'nodemailer';
import "dotenv/config";

const {MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASSWORD, MAIL_FROM, SERVER_HOST, SERVER_PORT, SERVER_PROTOCOL} = process.env;

const sendMail = async (to, subject, html) => {
    const config = {
        host: MAIL_HOST,
        port: MAIL_PORT,
        secure: true,
        auth: {user: MAIL_USER, pass: MAIL_PASSWORD},
    };

    const transport = nodemailer.createTransport(config);
    const email = {from: MAIL_FROM, to, subject, html};

    return transport.sendMail(email)
        .then(info => console.log(info))
        .catch(err => {
            console.log(err);
            throw err;
        });
};

export const sendVerificationEmail = async (to, verificationToken) => {
    await sendMail(
        to,
        'Please verify your email',
        `<a target="_blank" href="${SERVER_PROTOCOL}://${SERVER_HOST}:${SERVER_PORT}/api/auth/verify/${verificationToken}">Click to verify email</a>`
    );
};

export default sendMail;
