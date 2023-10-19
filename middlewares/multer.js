const multer = require('multer');

const storage = multer.diskStorage({});
const upload = multer(
    {
        storage ,
        limits: { fieldSize: 1024 * 1024 * 10 },
    });

module.exports = upload;