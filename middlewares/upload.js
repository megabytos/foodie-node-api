import multer from "multer";
import HttpError from "../helpers/HttpError.js";

const storage = multer.memoryStorage();

const limits = {fileSize: 1024 * 1024 * 5};

const fileFilter = (req, file, callback) => {
    const fileExtension = file.originalname.split(".").pop();
    if (['exe', 'bat', 'msi', 'cmd', 'dmg', 'zip'].includes(fileExtension)) {
        return callback(HttpError(400, "File type is not supported"));
    }
    callback(null, true);
};

const upload = multer({storage, limits, fileFilter});

export default upload;