const ArtPiece = require("../../models/ArtPiece/ArtPiece");
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

exports.getArtPiece = async (req, res) => {
  try {
    const find = await ArtPiece.findOne({ _id: req.params._id }).exec();
    res.json(find);
  } catch (error) {
    return res.status(500).send(error);
  }
};

exports.createArtPiece = async (req, res) => {
  try {
    // Ensure the upload directory exists
    const uploadDir = `${__basedir}/uploads/ArtPiece`;
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Handle uploaded image
    let artImage = req.file ? await compressImage(req.file, uploadDir) : null;
   
    // Destructure the fields from req.body
    let { 
      artistName, 
      artName, 
      year, 
      artType, 
      size, 
      price, 
      artForm, 
      signature, 
      certificate, 
      frame, 
      link1, 
      link2, 
      isActive ,
      category
    } = req.body;

    // Check if art with the same name already exists (you can change this logic if you want to check for email or something else)
    const artPieceExists = await ArtPiece.findOne({ artName }).exec();

    if (artPieceExists) {
      return res.status(200).json({
        isOk: false,
        message: "Art piece with this name already exists",
      });
    } else {
      // Create a new Art Piece
      const newArtPiece = new ArtPiece({
        artistName,
        artName,
        year,
        artType,
        size,
        price,
        artForm,
        signature,
        certificate,
        frame,
        artImage,
        link1,
        link2,
        isActive,
        category // Set to true by default if not provided
      });

      // Save the new Art Piece
      const savedArtPiece = await newArtPiece.save();
      
      // Respond with the saved data
      return res.status(200).json({
        isOk: true,
        data: savedArtPiece,
        message: "Art piece created successfully",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};


exports.listArtPiece = async (req, res) => {
  try {
    const list = await ArtPiece.find({isActive : true}).sort({ createdAt: -1 }).exec();
    res.json(list);
  } catch (error) {
    return res.status(400).send(error);
  }
};

exports.listArtPieceByParams = async (req, res) => {
  try {
    let { skip, per_page, sorton, sortdir, match, isActive } = req.body;

    let query = [
      {
        $match: { isActive: isActive },
      },

      {
        $facet: {
          stage1: [
            {
              $group: {
                _id: null,
                count: {
                  $sum: 1,
                },
              },
            },
          ],
          stage2: [
            {
              $skip: skip,
            },
            {
              $limit: per_page,
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$stage1",
        },
      },
      {
        $project: {
          count: "$stage1.count",
          data: "$stage2",
        },
      },
    ];
    if (match) {
      query = [
        {
          $match: {
            $or: [
              {
                artName: { $regex: match, $options: "i" },
              },
              {
                artistName: { $regex: match, $options: "i" },
              },
              
            ],
          },
        },
      ].concat(query);
    }

    if (sorton && sortdir) {
      let sort = {};
      sort[sorton] = sortdir == "desc" ? -1 : 1;
      query = [
        {
          $sort: sort,
        },
      ].concat(query);
    } else {
      let sort = {};
      sort["createdAt"] = -1;
      query = [
        {
          $sort: sort,
        },
      ].concat(query);
    }

    const list = await ArtPiece.aggregate(query);

    res.json(list);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

exports.updateArtPiece = async (req, res) => {
  try {
    let artImage = req.file
      ? `uploads/ArtPiece/${req.file.filename}`
      : null;
    let fieldvalues = { ...req.body };
    if (artImage != null) {
      fieldvalues.artImage = artImage;
    }
    const update = await ArtPiece.findOneAndUpdate(
      { _id: req.params._id },
      fieldvalues,
      { new: true }
    );
    res.json(update);
  } catch (err) {
    res.status(400).send(err);
  }
};

exports.removeArtPiece = async (req, res) => {
  try {
    const del = await ArtPiece.findOneAndRemove({
      _id: req.params._id,
    });
    res.json(del);
  } catch (err) {
    res.status(400).send(err);
  }
};


async function compressImage(file, uploadDir) {
  const filePath = path.join(uploadDir, file.filename);
  const compressedPath = path.join(uploadDir, `compressed-${file.filename}`);

  try {
    let quality = 80;
    let compressed = false;

    do {
      await sharp(file.path)
        .resize({ width: 1920 }) // Resize image width to 1920px, maintaining aspect ratio
        .jpeg({ quality }) // Adjust the quality to reduce the size
        .toFile(compressedPath);

      const { size } = fs.statSync(compressedPath);
      if (size <= 100 * 1024 || quality <= 20) { // Check if size is under 100 KB or quality is too low
        compressed = true;
      } else {
        quality -= 10; // Reduce quality further if size is still too large
      }
    } while (!compressed);

    // Replace the original image with the compressed one
    fs.unlinkSync(filePath);
    fs.renameSync(compressedPath, filePath);

    return `uploads/ArtPiece/${file.filename}`;
  } catch (error) {
    console.log('Error compressing image:', error);
    return null;
  }
}

 
