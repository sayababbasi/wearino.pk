import {v2 as cloudinary} from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();
const clean = (val) => val ? val.toString().replace(/[^\w-]/g, '').trim() : '';
cloudinary.config({
    cloud_name: clean(process.env.CLOUDINARY_CLOUD_NAME),
    api_key: clean(process.env.CLOUDINARY_API_KEY),
    api_secret: clean(process.env.CLOUDINARY_API_SECRET),
});
export default cloudinary;
