import express from 'express';
import { logout, current, verify, resend, userRegisterController, userLoginController, updateUserAvatarController } from '../controllers/usersControllers.js';
import { emailVerificationSchema, userRegisterSchema, userLoginSchema } from '../schemas/usersSchemas.js';
import validateBody from '../helpers/validateBody.js';
import controllerWrapper from '../helpers/controllerWrapper.js';
import auth from '../middlewares/authenticate.js';
import upload from '../middlewares/upload.js';
import isEmptyBody from '../middlewares/isEmptyBody.js';

const usersRouter = express.Router();

usersRouter.post('/register', isEmptyBody, validateBody(userRegisterSchema), controllerWrapper(userRegisterController));

usersRouter.post('/login', validateBody(userLoginSchema), controllerWrapper(userLoginController));

// usersRouter.post('/logout', auth, controllerWrapper(logout));

// usersRouter.get('/current', auth, controllerWrapper(current));

// usersRouter.get('/:id', controllerWrapper());

// usersRouter.patch('/:id/follow', controllerWrapper());

// usersRouter.patch('/:id/unfollow', controllerWrapper());

// usersRouter.get('/followers', controllerWrapper());

// usersRouter.get('/following', controllerWrapper());

usersRouter.patch('/avatars', auth, upload.single('avatar'), controllerWrapper(updateUserAvatarController));

// usersRouter.post('/verify', validateBody(emailVerificationSchema), controllerWrapper(resend));

// usersRouter.get('/verify/:verificationToken', controllerWrapper(verify));

export default usersRouter;
