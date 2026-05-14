import {v2 as cloudinary} from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();
const cleanEnvVar = (val) => val ? val.toString().trim().replace(/[\r\n]/g, '') : '';
cloudinary.config({
    cloud_name: cleanEnvVar(process.env.CLOUDINARY_CLOUD_NAME),
    api_key: cleanEnvVar(process.env.CLOUDINARY_API_KEY),
    api_secret: cleanEnvVar(process.env.CLOUDINARY_API_SECRET),
});
export default cloudinary;
