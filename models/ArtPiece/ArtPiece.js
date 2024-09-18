const mongoose = require("mongoose");
const { Schema, model, Types } = require("mongoose");
const ArtPieceSchema = new mongoose.Schema(
  {
    artistName: {
      type: String,
    },
    artName: {
      type: String,
    },
    year: {
        type: String,
      },
    artType: {
      type: String,
    },
    size: {
        type: String,
    },
    price: {
        type: String,
    },
    artForm: {
        type: String,
    },
    signature: {
        type: String,
    },
    certificate: {
        type: String,
    },frame: {
        type: String,
    },
    artImage: {
        type: String,
    },
    link1: {
        type: String,
    },
    link2: {
        type: String,
    },
    category: {
      type: String,
  },

    isActive:{
        type: Boolean,
        default:true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ArtPiece", ArtPieceSchema);
