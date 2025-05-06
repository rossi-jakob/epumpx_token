const express = require("express");
const router = express.Router();
const miscController = require("../controllers/miscController");
const path = require('path')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')

const fileFilter = (req, file, cb) => {
    // JPEG, JPG, GIF, WebP, BMP, SVG
    const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'];
    if (allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../uploads/logos"))
    },
    filename: function (req, file, cb) {
        cb(null, uuidv4() + file.originalname)
    }
})
const upload = multer({
    storage: storage,
    fileFilter: fileFilter
})

router.post("/query", async (req, res) => {
    try {
        let data = await miscController.query(req.body);
        res.send(
            data
        );
    } catch (err) {
        console.log(err);
        res.send({ success: false });
    }
});

router.post("/prices", async (req, res) => {
    try {
        let data = await miscController.getPrices(req.body);
        res.send(
            data
        );
    } catch (err) {
        console.log(err);
        res.send({ success: false, data: [] });
    }
});

router.post("/upload_image", upload.fields([{ name: "image" }]), async (req, res) => {
    try {
        let data = await miscController.uploadLogo(req.files.image[0].filename);
        res.send(
            data
        );
    } catch (err) {
        console.log(err);
        res.send({ success: false });
    }
});

module.exports = router;