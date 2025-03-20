import express from 'express';
import {
    userRegisterController,
    userLoginController,
    updateUserAvatarController,
    userLogoutController,
    userCurrentController,
    userCurrentFullController,
    followUserController,
    unfollowUserController,
    followersController,
    followingController,
} from '../controllers/usersControllers.js';
import { userRegisterSchema, userLoginSchema } from '../schemas/usersSchemas.js';
import validateBody from '../helpers/validateBody.js';
import controllerWrapper from '../helpers/controllerWrapper.js';
import auth from '../middlewares/authenticate.js';
import upload from '../middlewares/upload.js';
import isEmptyBody from '../middlewares/isEmptyBody.js';

const usersRouter = express.Router();

usersRouter.post('/register', isEmptyBody, validateBody(userRegisterSchema), controllerWrapper(userRegisterController));

usersRouter.post('/login', validateBody(userLoginSchema), controllerWrapper(userLoginController));

usersRouter.post('/logout', auth, controllerWrapper(userLogoutController));

usersRouter.get('/current/full', auth, controllerWrapper(userCurrentFullController));

usersRouter.get('/current', auth, controllerWrapper(userCurrentController));

usersRouter.patch('/avatars', auth, upload.single('avatar'), controllerWrapper(updateUserAvatarController));

// usersRouter.get('/:id', controllerWrapper());

usersRouter.patch('/:id/follow', auth, controllerWrapper(followUserController));

usersRouter.patch('/:id/unfollow', auth, controllerWrapper(unfollowUserController));

usersRouter.get('/followers', auth, controllerWrapper(followersController));

usersRouter.get('/following', auth, controllerWrapper(followingController));

export default usersRouter;
