const multer = require("multer");
const path = require("path");

const uploadPath = path.join(__dirname, "../", "uploads");

const multerConfig = multer.diskStorage({
    destination: uploadPath,
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({
    storage: multerConfig,
});

module.exports = upload;
