import cloudinary from 'cloudinary';
import 'dotenv/config';

const { CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

cloudinary.v2.config({
    secure: true,
    cloud_name: CLOUDINARY_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
});

const saveToCloudinary = async (file, folderName = '') => {
    return new Promise((resolve, reject) => {
        const uploadOptions = {
            resource_type: 'image',
        };
        if (folderName) {
            uploadOptions.folder = folderName;
        }
        const stream = cloudinary.v2.uploader.upload_stream(uploadOptions, (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
        });
        stream.end(file.buffer);
    });
};

export default saveToCloudinary;
