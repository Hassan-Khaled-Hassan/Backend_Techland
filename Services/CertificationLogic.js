/* eslint-disable import/no-extraneous-dependencies */
const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("cloudinary").v2;
const { uploadSingleImage } = require("../middleWares/uploadCloudImages");
const CertificationModel = require("../Models/CertificationModel");
const APIError = require("../Utils/apiError");
const ApiFeatures = require("../Utils/ApiFeatures");

exports.uploadProductImages = uploadSingleImage("image");

// ============================================================
// Helper function to upload an image to Cloudinary
const uploadToCloudinary = (buffer, folder, publicId) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId },
      (error, result) => {
        if (error) reject(new APIError("Image upload failed", 500));
        else resolve(result);
      }
    );
    stream.end(buffer);
  });

exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();
  // 1. Handle imageCover
  // console.log(req.file)
  if (req.file) {
    const imageCoverFileName = `${
      req.body.slug
    }-Certification-${uuidv4()}-${Date.now()}-.jpeg`;
    const buffer = await sharp(req.file.buffer)
      // .resize(1000, 1333)
      .toFormat("png")
      .png({ quality: 100, compressionLevel: 9 })
      .toBuffer();

    try {
      const coverResult = await uploadToCloudinary(
        buffer,
        "TechLandBS/Certifications",
        imageCoverFileName
      );
      req.body.image = {
        name: imageCoverFileName,
        url: coverResult.secure_url,
      };
    } catch (error) {
      return next(error); // Forward error to error handler
    }
  }
  next(); // Proceed to the next middleware after all images are processed
});
// ==================================================
const deleteImageFromCloudinary = async (publicId, next) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Cloudinary delete result:", result);

    if (result.result === "ok") {
      console.log(`Image with public_id ${publicId} deleted successfully.`);
      return true;
    } else if (result.result === "not found") {
      return;
    } else {
      return next(
        new APIError(`Failed to delete image with public_id ${publicId}.`, 404)
      );
    }
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    return next(new Error("Could not delete image from Cloudinary"));
  }
};
// ==================================================
exports.CreateCertification = asyncHandler(async (req, res, next) => {
  try {
    const Category = await CertificationModel.create(req.body);
    res.status(201).json({ statues:"success" ,data: Category });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// =====================
exports.GetAllCertifications = asyncHandler(async (req, res, next) => {
  try {
    const countDocuments = await CertificationModel.count();
    const apiFeatures = new ApiFeatures(CertificationModel, req.query)
      .Pagination(countDocuments)
      .Filter()
      .Search("Certification")
      .limitField()
      .Sort();

    const Certification = await apiFeatures.buildQuery();
    for (const category of Certification) {
      if (typeof category.image === "string") {
        category.image = JSON.parse(category.image);
        await category.save();
      }
    }

    res.status(200).json({
      results: Certification.length,
      PaginationResult: apiFeatures.PaginationResult,
      data: Certification,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

exports.GetOneCertification = asyncHandler(async (req, res, next) => {
  try {
    const data = await CertificationModel.findByPk(req.params.id);
    if (!data) {
      return next(
        new APIError(`No Certification found for this id ${req.params.id}`, 404)
      );
    }
    if (typeof data.image === "string") {
      data.image = JSON.parse(data.image);
      await data.save();
    }
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

exports.deleteOneCertification = asyncHandler(async (req, res, next) => {
  try {
    // Fetch the product to get the public_id of the image
    const data = await CertificationModel.findByPk(req.params.id);
    if (!data) {
      return next(
        new APIError(
          `No Certification found for this id ${req.params.id}`,
          404
        )
      );
    }
    if (typeof data.image === "string") {
      data.image = JSON.parse(data.image);
      await data.save();
    }

    const publicId = `TechLandBS/Certifications/${data.image.name}`; // Assuming you store Cloudinary public_id in this field
    // Delete the image from Cloudinary
    if (publicId && data.image) {
      await deleteImageFromCloudinary(publicId);
    }
    // Delete the product from the database
    await CertificationModel.destroy({ where: { id: req.params.id } });
    res.status(200).send({ message: `Certification deleted Successfully` });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

exports.UpdateOneCertification = asyncHandler(async (req, res, next) => {
  try {
    // Fetch the category to get the public_id of the image
    const category = await CertificationModel.findByPk(req.params.id);
    // Use primary key (id)
    if (!category) {
      return next(
        new APIError(`No Certification found for this id ${req.params.id}`, 404)
      );
    }
    if (typeof category.image === "string") {
      category.image = JSON.parse(category.image);
      await category.save();
    }
    //  console.log(req.body);
    const publicId = `TechLandBS/Certifications/${category.image.name}`; // Assuming you store Cloudinary public_id in this field
    // Delete the image from Cloudinary
    if (publicId && req.body.image) {
      await deleteImageFromCloudinary(publicId);
    }
    // console.log("=======================1");
    // console.log(req.body);
    // Update the category
    const updatedCategory = await CertificationModel.update(req.body, {
      where: { id: req.params.id },
      returning: true, // Returns the updated row
    });
    // if (updatedCategory[1] != 1) {
    //   return next(
    //     new APIError(
    //       `No Certification found for this id :  ${req.params.id}`,
    //       404
    //     )
    //   );
    // }
    const categoryUpdated = await CertificationModel.findByPk(req.params.id);
    if (typeof categoryUpdated.image === "string") {
      categoryUpdated.image = JSON.parse(categoryUpdated.image);
      await categoryUpdated.save();
    }
    res.status(200).json({
      message: `Certification Updated Successfully`,
      data: categoryUpdated,
    });
  } catch (error) {
    res.status(500).json({ message: "is Server error", error: error.message });
  }
});