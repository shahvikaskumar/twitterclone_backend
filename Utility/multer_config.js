const multer = require('multer');
const path = require('path');

// Set up storage engine
const storage = multer.diskStorage({
    destination:'./images',
    filename:(req, file, cb) => {
        cb(null,'profile-pic-', date.now() + path.extname(file.originalname));
    }
});

// Initialize upload
const upload = multer({
    storage:storage,
    limits:{ fileSize:1000000},
    fileFilter: (req, file, cb) => {
        checkfiletype(file, cb);
    }
}).single('profilepic');

// Check file type
function checkfiletype(file, cb){
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname){
        return cb(null, true);
    }
    else {
        cb('Error: Images Only!');
    }
}

module.exports = upload;