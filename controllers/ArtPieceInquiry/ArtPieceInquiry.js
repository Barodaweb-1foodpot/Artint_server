const Inquiry = require("../../models/ArtPieceInquiry/ArtPieceInquiry");
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { lookup } = require("dns");

exports.getInquiry = async (req, res) => {
    try {
        const find = await Inquiry.findOne({ _id: req.params._id }).exec();
        res.json(find);
    } catch (error) {
        return res.status(500).send(error);
    }
};

exports.createInquiry = async (req, res) => {
    try {
        // Ensure the upload directory exists


        // Handle uploaded image

        // Destructure the fields from req.body
        let {
            name,
            artName,
            email,
            phone,
            countryCode,
            desc,

            isActive,

        } = req.body;

        // Check if art with the same name already exists (you can change this logic if you want to check for email or something else)

        // Create a new Art Piece
        const newInquiry = new Inquiry({
            name,
            artName,
            email,
            phone,
            countryCode,
            desc,

            isActive
        });

        // Save the new Art Piece
        const savedInquiry = await newInquiry.save();

        // Respond with the saved data
        return res.status(200).json({
            isOk: true,
            data: savedInquiry,
            message: "Inquiry created successfully",
        });

    } catch (err) {
        console.log(err);
        return res.status(500).send("Internal Server Error");
    }
};


exports.listInquiry = async (req, res) => {
    try {
        const list = await Inquiry.find({ isActive: true }).sort({ createdAt: -1 }).exec();
        res.json(list);
    } catch (error) {
        return res.status(400).send(error);
    }
};

exports.listInquiryByParams = async (req, res) => {
    try {
        let { skip, per_page, sorton, sortdir, match, isActive } = req.body;

        let query = [
            {
                $match: { isActive: isActive },
            },
            {
                $lookup: {
                    from: "artpieces",
                    localField: "artName",
                    foreignField: "_id",
                    as: "artNameDetails",
                },
            },

            {
                $addFields: {
                  firstArtName: { $arrayElemAt: ["$artNameDetails.artName", 0] },
                },
              },

            {
                $match: {
                    $or: [
                        {
                            firstArtName: { $regex: match, $options: "i" },
                          },
                        {
                            name: { $regex: match, $options: "i" },
                        },
                        {
                            phone: { $regex: match, $options: "i" },
                        },
                        {
                            countryCode: { $regex: match, $options: "i" },
                        },
                        {
                            email: { $regex: match, $options: "i" },
                        },
                        {
                            desc: { $regex: match, $options: "i" },
                        },
                    ],
                }
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

        const list = await Inquiry.aggregate(query);

        res.json(list);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
};

exports.updateInquiry = async (req, res) => {
    try {

        let fieldvalues = { ...req.body };


        const update = await Inquiry.findOneAndUpdate(
            { _id: req.params._id },
            fieldvalues,
            { new: true }
        );
        res.json({
            isOk: true,
            data: update,
            message: "Inquiry updated successfully",
        });
    } catch (err) {
        res.status(400).send(err);
    }
};

exports.removeInquiry = async (req, res) => {
    try {
        const del = await Inquiry.findOneAndRemove({
            _id: req.params._id,
        });
        res.json(del);
    } catch (err) {
        res.status(400).send(err);
    }
};


