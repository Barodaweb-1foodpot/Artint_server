const mongoose = require("mongoose");
const { Schema, model, Types } = require("mongoose");
const ArtPieceSchema = new mongoose.Schema(
  {
    artName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ArtPieceSchema",
        // required: true,
    },
    name: {
      type: String,
    },
    phone: {
        type: String,
      },
    countryCode: {
      type: String,
    },
    email: {
        type: String,
    },
    desc: {
        type: String,
    },
   

    isActive:{
        type: Boolean,
        default:true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ArtPieceInquiry", ArtPieceSchema);
