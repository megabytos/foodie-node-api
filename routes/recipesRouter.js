import express from "express";
import {getAllRecipes, getOneRecipe, deleteRecipe, createRecipe, updateRecipe, popularRecipes, updateFavoriteController} from "../controllers/recipesControllers.js";
import {createRecipeSchema, updateRecipeSchema, updateStatusRecipeSchema} from "../schemas/recipesSchemas.js"
import validateBody from "../helpers/validateBody.js";
import controllerWrapper from "../helpers/controllerWrapper.js";
import auth from "../middlewares/authenticate.js";

const recipesRouter = express.Router();

recipesRouter.get("/", controllerWrapper(getAllRecipes));

recipesRouter.get("/popular", controllerWrapper(popularRecipes));

recipesRouter.get("/:id", controllerWrapper(getOneRecipe));

recipesRouter.delete("/:id", auth, controllerWrapper(deleteRecipe));

recipesRouter.post("/", auth, validateBody(createRecipeSchema), controllerWrapper(createRecipe));

recipesRouter.put("/:id", auth, validateBody(updateRecipeSchema), controllerWrapper(updateRecipe));

recipesRouter.patch("/:id/favorite", auth, validateBody(updateStatusRecipeSchema), controllerWrapper(updateFavoriteController));

export default recipesRouter;
