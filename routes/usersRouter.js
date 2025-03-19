import express from "express";
import {register, login, logout, current, avatar, verify, resend} from "../controllers/usersControllers.js";
import {userSchema, emailVerificationSchema} from "../schemas/usersSchemas.js"
import validateBody from "../helpers/validateBody.js";
import controllerWrapper from "../helpers/controllerWrapper.js";
import auth from "../middlewares/authenticate.js";
import upload from "../middlewares/upload.js";


const usersRouter = express.Router();

usersRouter.post("/register", validateBody(userSchema), controllerWrapper(register));

usersRouter.post("/login", validateBody(userSchema), controllerWrapper(login));

usersRouter.post("/logout", auth, controllerWrapper(logout));

usersRouter.get("/current", auth, controllerWrapper(current));

usersRouter.get("/:id", controllerWrapper());

usersRouter.patch("/:id/follow", controllerWrapper());

usersRouter.patch("/:id/unfollow", controllerWrapper());

usersRouter.get("/followers", controllerWrapper());

usersRouter.get("/following", controllerWrapper());

usersRouter.patch("/avatars", auth, upload.single('avatar'), controllerWrapper(avatar));

usersRouter.post("/verify", validateBody(emailVerificationSchema), controllerWrapper(resend));

usersRouter.get("/verify/:verificationToken", controllerWrapper(verify));

export default usersRouter;