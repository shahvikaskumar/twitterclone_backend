const multer = require('multer');
const {v2:cloudinary} = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Set up storage engine
const storage = new CloudinaryStorage({
    cloudinary:cloudinary,
    params:{
        folder:`arham-tweet/images/`,
        allowedFormats:['jpg','png','jpeg'],

    }
});

// Initialize upload
const upload  = multer({
    storage:storage,            
}).single('image');  


module.exports = upload;