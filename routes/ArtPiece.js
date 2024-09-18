const express = require("express");

const router = express.Router();

const catchAsync = require("../utils/catchAsync");
const {
  createArtPiece,
  listArtPiece,
  listArtPieceByParams,
  getArtPiece,
  updateArtPiece,
  removeArtPiece,
  userLoginAdmin,
} = require("../controllers/ArtPiece/ArtPiece");
const multer = require("multer");
const path= require('path')
const fs= require('fs')


const directories = ["uploads/ArtPiece"];

directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {

        cb(null, "uploads/ArtPiece");

    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname);
    },
});
const upload = multer({ storage: multerStorage });

router.post("/auth/create/ArtPiece",upload.single("artImage"), catchAsync(createArtPiece));

router.get("/auth/list/ArtPiece", catchAsync(listArtPiece));

router.post("/auth/listByparams/ArtPiece", catchAsync(listArtPieceByParams));

router.get("/auth/get/ArtPiece/:_id", catchAsync(getArtPiece));

router.put("/auth/update/ArtPiece/:_id",upload.single("artImage"), catchAsync(updateArtPiece));

router.delete("/auth/remove/ArtPiece/:_id", catchAsync(removeArtPiece));

router.post("/adminLogin", catchAsync(userLoginAdmin));

module.exports = router;
