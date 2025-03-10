/* eslint-disable import/no-extraneous-dependencies */
const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("cloudinary").v2;
const { uploadSingleImage } = require("../middleWares/uploadCloudImages");
const categoryModel = require("../Models/categoryModel");
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
  if (req.file) {
    const imageCoverFileName = `${
      req.body.slug
    }-category-${uuidv4()}-${Date.now()}-Cover.jpeg`;
    const buffer = await sharp(req.file.buffer)
      // .resize(1000, 1333)
      .toFormat("png")
      .png({ quality: 100, compressionLevel: 9 })
      .toBuffer();

    try {
      const coverResult = await uploadToCloudinary(
        buffer,
        "TechLandBS/categories",
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
exports.CreateCategory = asyncHandler(async (req, res, next) => {
  try {
    const category = await categoryModel.create(req.body);
    res.status(201).json({ statues:"success", data: category });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// =====================
exports.GetAllCategory = asyncHandler(async (req, res, next) => {
  try {
    const countDocuments = await categoryModel.count(); // Count total documents
    const apiFeatures = new ApiFeatures(categoryModel, req.query)
      .Pagination(countDocuments)
      .Filter()
      .Search("Category") // Specify the model name for search
      .limitField()
      .Sort();

    const categories = await apiFeatures.buildQuery(); // Execute the built query
    for (const category of categories) {
      if (typeof category.image === "string") {
        category.image = JSON.parse(category.image);
        await category.save();
      }
    }

    res.status(200).json({
      results: categories.length,
      PaginationResult: apiFeatures.PaginationResult,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


exports.GetOneCategory = asyncHandler(async (req, res, next) => {
  try {
    const category = await categoryModel.findByPk(req.params.id); // Use primary key (id)
    if (!category) {
      return next(
        new APIError(`No Category found for this id ${req.params.id}`, 404)
      );
    }
    if (typeof category.image === "string") {
      category.image = JSON.parse(category.image);
      await category.save();
    }

    res.status(200).json({ status : "success",data: category });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

exports.deleteOneCategory = asyncHandler(async (req, res, next) => {
  try {
    // Fetch the category to get the public_id of the image
    const category = await categoryModel.findByPk(req.params.id); // Use primary key (id)
    if (!category) {
      return next(
        new APIError(`No Category found for this id ${req.params.id}`, 404)
      );
    }
    if (typeof category.image === "string") {
      category.image = JSON.parse(category.image);
      await category.save();
    }

    const publicId = `TechLandBS/categories/${category.image.name}`; // Assuming you store Cloudinary public_id in this field
    // Delete the image from Cloudinary
    if (publicId && category.image) {
      await deleteImageFromCloudinary(publicId, next);
    }
    // Delete the category from the database
    await categoryModel.destroy({ where: { id: req.params.id } });
    res.status(200).send({ message: `Category deleted Successfully` });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

exports.UpdateOneCategory = asyncHandler(async (req, res, next) => {
  try {
    // Fetch the category to get the public_id of the image
    const category = await categoryModel.findByPk(req.params.id);
    console.log(category);
     // Use primary key (id)
    if (!category) {
      return next(
        new APIError(`No Category found for this id ${req.params.id}`, 404)
      );
    }
    if (typeof category.image === "string") {
      category.image = JSON.parse(category.image);
      await category.save();
    }
    const publicId = `TechLandBS/categories/${category.image.name}`; // Assuming you store Cloudinary public_id in this field
    // Delete the image from Cloudinary
    if (publicId && req.body.image) {
      await deleteImageFromCloudinary(publicId);
    }
    console.log(req.body);
    // Update the category
    const updatedCategory = await categoryModel.update(req.body, {
      where: { id: req.params.id },
      returning: true, // Returns the updated row
    });
    console.log(updatedCategory);
    // if (updatedCategory[1] != 1) {
    //   return next(
    //     new APIError(`No Category is found for this id :  ${req.params.id}`, 404)
    //   );
    // }
    const categoryUpdated = await categoryModel.findByPk(req.params.id);
        if (typeof categoryUpdated.image === "string") {
          categoryUpdated.image = JSON.parse(categoryUpdated.image);
          await categoryUpdated.save();
        }
    res.status(200).json({
      message: `Category Updated Successfully`,
      data: categoryUpdated,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
