const express = require('express');
const router = express.Router();
const multer = require('multer');
const mimeType = require('mime-types');
const random = require('random');

//1. Գրել ծրագիր որ թույլ կտա վերբեռնել ֆայլ և պահպանել Homework պապկայի upload պապակայում ՝
// պահպանելիս ընտրել պատահական 6-անիշ թվերից կազմված անուն:
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'homeworks/upload/');
    },
    filename: function (req, file, cb) {
        cb(null, random.int(1e5, 1e6) + '.' + mimeType.extension(file.mimetype));
    }
});

const upload = multer({storage: storage});

router.post('/', upload.single('file'), (req, res) => {
    res.json(req.file);
});

module.exports = router;
