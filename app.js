import express from "express";
import morgan from "morgan";
import cors from "cors";
import "dotenv/config";
import {verifyDirectories} from "./middlewares/upload.js";

import recipesRouter from "./routes/recipesRouter.js";
import usersRouter from "./routes/usersRouter.js";
import otherRouter from "./routes/otherRouter.js";

const app = express();

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.use("/api/recipes", recipesRouter);
app.use("/api/users", usersRouter);
app.use("/api", otherRouter);

app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

app.listen(3000, async () => {
  verifyDirectories()
      .then(() => console.log('Directories verified successfully.'))
      .catch(err => console.log('Unable to verify working directories: ' + err.message));
  console.log("Server is running. Use our API on port: 3000");
});
