import multer from "multer";
import path from "node:path";
import HttpError from "../helpers/HttpError.js";
import fs from "fs/promises";

const destination = path.join(process.cwd(), "temp");
const publicPath = path.join(process.cwd(), "public");
export const avatarsPath = path.join(process.cwd(), "public", "avatars");
export const avatarsDir = "avatars";

const isAccessible = async (path) => {
    try {
        await fs.access(path);
        return true;
    } catch {
        return false;
    }
};

const createFolderIfNotExist = async (folder) => {
    if (!(await isAccessible(folder))) {
        await fs.mkdir(folder);
    }
};

export const verifyDirectories = async () => {
    try {
        await createFolderIfNotExist(destination);
        await createFolderIfNotExist(publicPath);
        await createFolderIfNotExist(avatarsPath);
        return true;
    } catch (error) {
        return false;
    }
};



const filename = (_, file, callback) => {
    const prefix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    callback(null, `${prefix}_${file.originalname}`);
}

const storage = multer.diskStorage({destination, filename});

const limits = {fileSize: 1024 * 1024 * 5};

const fileFilter = (req, file, callback) => {
    const fileExtension = file.originalname.split(".").pop();
    if (['exe', 'bat', 'msi', 'cmd', 'dmg'].includes(fileExtension)) {
        return callback(HttpError(400, "File type is not supported"));
    }
    callback(null, true);
};

const upload = multer({storage, limits, fileFilter});

export default upload;