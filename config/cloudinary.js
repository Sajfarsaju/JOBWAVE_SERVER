const cloudinaryModule = require('cloudinary');

const cloudinary = cloudinaryModule.v2

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (file, options) => {
    try {
        const uploadResponse = await cloudinary.uploader.upload(file, options);
        const secureUrl = uploadResponse.secure_url;
        return secureUrl;
    } catch (error) {
        console.log(error, "An error occurred while saving to cloudinary");
    }
}

module.exports = { cloudinary, uploadToCloudinary };

