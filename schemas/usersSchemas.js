import Joi from 'joi';
import { emailRegexp } from '../constants/regexp.js';

export const userRegisterSchema = Joi.object({
    name: Joi.string().min(3).max(20).required().messages({
        'any.required': 'Name is required.',
        'string.empty': 'Name cannot be empty.',
        'string.min': 'Name should be at least 3 characters long.',
        'string.max': 'Name should not exceed 20 characters.',
    }),
    email: Joi.string().pattern(emailRegexp).message('Email must must be in valid format').required(),
    password: Joi.string().min(8).required().messages({
        'any.required': 'Password is required',
        'string.empty': 'Password cannot be empty',
    }),
});

export const userLoginSchema = Joi.object({
    email: Joi.string().pattern(emailRegexp).message('Email must must be in valid format').required(),
    password: Joi.string().min(8).required().messages({
        'any.required': 'Password is required',
        'string.empty': 'Password cannot be empty',
    }),
});

export const emailVerificationSchema = Joi.object({
    email: Joi.string().pattern(emailRegexp).message('Email must must be in valid format').required(),
});

export const loginWithGoogleOAuthSchema = Joi.object({
    code: Joi.string().required().messages({
        'any.required': 'Code is required.',
        'string.empty': 'Code cannot be empty.',
    }),
});
