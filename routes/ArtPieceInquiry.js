const express = require("express");

const router = express.Router();

const catchAsync = require("../utils/catchAsync");
const {
  createInquiry,
  listInquiry,
  listInquiryByParams,
  getInquiry,
  updateInquiry,
  removeInquiry,
  userLoginAdmin,
} = require("../controllers/ArtPieceInquiry/ArtPieceInquiry");
const multer = require("multer");
const path= require('path')
const fs= require('fs')


const directories = ["uploads/Inquiry"];

directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {

        cb(null, "uploads/Inquiry");

    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname);
    },
});
const upload = multer({ storage: multerStorage });

router.post("/auth/create/Inquiry", catchAsync(createInquiry));

router.get("/auth/list/Inquiry", catchAsync(listInquiry));

router.post("/auth/listByparams/Inquiry", catchAsync(listInquiryByParams));

router.get("/auth/get/Inquiry/:_id", catchAsync(getInquiry));

router.put("/auth/update/Inquiry/:_id", catchAsync(updateInquiry));

router.delete("/auth/remove/Inquiry/:_id", catchAsync(removeInquiry));

router.post("/adminLogin", catchAsync(userLoginAdmin));

module.exports = router;
