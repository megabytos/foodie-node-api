import express from 'express';
import {
    userRegisterController,
    userLoginController,
    updateUserAvatarController,
    userLogoutController,
    userCurrentController,
    followUserController,
    unfollowUserController,
    followersController,
    followingController,
    userFullDetailsController,
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

usersRouter.get('/user-details/:userId', auth, controllerWrapper(userFullDetailsController));

usersRouter.get('/current', auth, controllerWrapper(userCurrentController));

usersRouter.patch('/avatars', auth, upload.single('avatar'), controllerWrapper(updateUserAvatarController));

usersRouter.post('/:id/follow', auth, controllerWrapper(followUserController));

usersRouter.delete('/:id/unfollow', auth, controllerWrapper(unfollowUserController));

usersRouter.get('/:id/followers', auth, controllerWrapper(followersController));

usersRouter.get('/following', auth, controllerWrapper(followingController));

export default usersRouter;
