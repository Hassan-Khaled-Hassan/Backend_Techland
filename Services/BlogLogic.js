/* eslint-disable import/no-extraneous-dependencies */
const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("cloudinary").v2;
const { uploadSingleImage } = require("../middleWares/uploadCloudImages");
const { Category, BlogsModel } = require("../Models/associations");
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
    }-Blog-${uuidv4()}-${Date.now()}-Cover.jpeg`;
    const buffer = await sharp(req.file.buffer)
      // .resize(1000, 1333)
      .toFormat("png")
      .png({ quality: 100, compressionLevel: 9 })
      .toBuffer();

    try {
      const coverResult = await uploadToCloudinary(
        buffer,
        "TechLandBS/Blogs",
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
exports.CreateBlog = asyncHandler(async (req, res, next) => {
  try {
    const category = await BlogsModel.create(req.body);
    res.status(201).json({ statues: "success", data: category });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// =====================
exports.GetAllBlogs = asyncHandler(async (req, res, next) => {
  try {
    const countDocuments = await BlogsModel.count(); // Count total documents
    const apiFeatures = new ApiFeatures(BlogsModel, req.query)
      .Pagination(countDocuments)
      .Filter()
      .Search("Blogs") // Specify the model name for search
      .limitField()
      .Sort();

    const categories = await apiFeatures.buildQuery({
      include: [
        {
          model: Category,
          as: "category", // Make sure alias matches exactly
          attributes: ["id", "name", "description", "image"], // Include specific fields to populate
        },
      ],
    }); // Execute the built query

    // Ensure Benefits is parsed
    const formattedCategories = categories.map((Cat) => ({
      ...Cat.toJSON(), // Convert Sequelize model to plain object
      image: typeof Cat.image === "string" ? JSON.parse(Cat.image) : Cat.image,
      Benefits:
        typeof Cat.Benefits === "string"
          ? JSON.parse(Cat.Benefits)
          : Cat.Benefits,
      category: {
        ...Cat.category, // Ensure nested category properties are included
        image:
          typeof Cat.category?.image === "string"
            ? JSON.parse(Cat.category.image)
            : Cat.category?.image,
      },
    }));

    res.status(200).json({
      results: formattedCategories.length,
      PaginationResult: apiFeatures.PaginationResult,
      data: formattedCategories,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

exports.GetOneBlog = asyncHandler(async (req, res, next) => {
  try {
    const category = await BlogsModel.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          as: "category", // Make sure alias matches exactly
          attributes: ["id", "name", "description", "image"], // Include specific fields to populate
        },
      ],
    }); // Use primary key (id)
    if (!category) {
      return next(
        new APIError(`No Blog found for this id ${req.params.id}`, 404)
      );
    }
    if (
      typeof category.image === "string" &&
      typeof category.Benefits === "string" &&
      typeof category.category.image === "string"
    ) {
      category.image = JSON.parse(category.image);
      category.Benefits = JSON.parse(category.Benefits);
      category.category.image = JSON.parse(category.category.image);
      await category.save();
    }

    res.status(200).json({ status: "success", data: category });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

exports.deleteOneBlog = asyncHandler(async (req, res, next) => {
  try {
    // Fetch the category to get the public_id of the image
    const category = await BlogsModel.findByPk(req.params.id); // Use primary key (id)
    if (!category) {
      return next(
        new APIError(`No Blog found for this id ${req.params.id}`, 404)
      );
    }
    if (typeof category.image === "string") {
      category.image = JSON.parse(category.image);
      await category.save();
    }

    const publicId = `TechLandBS/Blogs/${category.image.name}`; // Assuming you store Cloudinary public_id in this field
    // Delete the image from Cloudinary
    if (publicId && category.image) {
      await deleteImageFromCloudinary(publicId, next);
    }
    // Delete the category from the database
    await BlogsModel.destroy({ where: { id: req.params.id } });
    res.status(200).send({ message: `Blog deleted Successfully` });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

exports.UpdateOneBlog = asyncHandler(async (req, res, next) => {
  try {
    // Fetch the category to get the public_id of the image
    const category = await BlogsModel.findByPk(req.params.id);
    // Use primary key (id)
    if (!category) {
      return next(
        new APIError(`No Blog found for this id ${req.params.id}`, 404)
      );
    }
    if (typeof category.image === "string") {
      category.image = JSON.parse(category.image);
      await category.save();
    }
    const publicId = `TechLandBS/Blogs/${category.image.name}`; // Assuming you store Cloudinary public_id in this field
    // Delete the image from Cloudinary
    if (publicId && req.body.image) {
      await deleteImageFromCloudinary(publicId);
    }
    // Update the category
    const updatedCategory = await BlogsModel.update(req.body, {
      where: { id: req.params.id },
      returning: true, // Returns the updated row
    });
    // if (updatedCategory[1] != 1) {
    //   return next(
    //     new APIError(`No Blog found for this id :  ${req.params.id}`, 404)
    //   );
    // }
    const categoryUpdated = await BlogsModel.findByPk(req.params.id);
    if (typeof categoryUpdated.image === "string") {
      categoryUpdated.image = JSON.parse(categoryUpdated.image);
      await categoryUpdated.save();
    }
    res.status(200).json({
      message: `Blogs Updated Successfully`,
      data: categoryUpdated,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
