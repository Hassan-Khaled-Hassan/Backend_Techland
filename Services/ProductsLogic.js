/* eslint-disable import/no-extraneous-dependencies */
const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("cloudinary").v2;
const { uploadMixOfImages } = require("../middleWares/uploadCloudImages");
const { Product, Category } = require("../Models/associations");
// const ClientType = require("../Models/ClientType");
const APIError = require("../Utils/apiError");
const ApiFeatures = require("../Utils/ApiFeatures");

exports.uploadProductImages = uploadMixOfImages([
  { name: "imageCover", maxCount: 1 },
]);
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
  // console.log(req.files);
  if (!req.files) return next();
  // 1. Handle imageCover
  //  console.log(req.files);
  if (req.files && req.files.imageCover) {
    const imageCoverFileName = `${
      req.body.slug
    }-product-${uuidv4()}-${Date.now()}-Cover.jpeg`;
    const buffer = await sharp(req.files.imageCover[0].buffer)
      // .resize(1000, 1333)
      .toFormat("png")
      .png({ quality: 100, compressionLevel: 9 })
      .toBuffer();

    try {
      const coverResult = await uploadToCloudinary(
        buffer,
        "TechLandBS/products",
        imageCoverFileName
      );
      req.body.imageCover = {
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
exports.CreateProduct = asyncHandler(async (req, res, next) => {
  try {
    const category = await Product.create(req.body);
    res.status(201).json({ statues: "success", data: category });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// =====================
exports.GetAllProducts = asyncHandler(async (req, res, next) => {
  try {
    const countDocuments = await Product.count(); // Count total documents
    const apiFeatures = new ApiFeatures(Product, req.query)
      .Pagination(countDocuments)
      .Filter()
      .Search("Product") // Specify the model name for search
      .limitField()
      .Sort();

    const clients = await apiFeatures.buildQuery({
      include: [
        {
          model: Category,
          as: "category", // Make sure alias matches exactly
          attributes: ["id", "name", "description", "image"], // Include specific fields to populate
        },
      ],
    });
    // console.log(Clients.associations); // Check if the association exists
    // console.log(ClientType.associations); // Check if the association exists

    const parsedClients = clients.map((client) => {
      if (
        typeof client.imageCover === "string" &&
        typeof client.category.image === "string"
      ) {
        client.imageCover = JSON.parse(client.imageCover);
        client.category.image = JSON.parse(client.category.image);
      }
      return client;
    });

    // console.log(JSON.stringify(clients, null, 2));

    res.status(200).json({
      results: parsedClients.length,
      PaginationResult: apiFeatures.PaginationResult,
      data: parsedClients,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

exports.GetOneProduct = asyncHandler(async (req, res, next) => {
  try {
    const category = await Product.findByPk(req.params.id, {
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
        new APIError(`No products found for this id ${req.params.id}`, 404)
      );
    }
    if (
      typeof category.imageCover === "string" &&
      typeof category.category.image === "string"
    ) {
      category.imageCover = JSON.parse(category.imageCover);
      category.category.image = JSON.parse(category.category.image);
      await category.save();
    }

    res.status(200).json({ status: "success", data: category });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

exports.deleteOneProduct = asyncHandler(async (req, res, next) => {
  try {
    // Fetch the product to get the public_id of the image
    const product = await Product.findByPk(req.params.id); // Use primary key (id)
    if (!product) {
      return next(
        new APIError(`No Product found for this id ${req.params.id}`, 404)
      );
    }

    // Handle imageCover deletion
    if (product.imageCover && typeof product.imageCover === "string") {
      product.imageCover = JSON.parse(product.imageCover);
    }
    if (product.imageCover?.name) {
      const publicId = `TechLandBS/products/${product.imageCover.name}`;
      await deleteImageFromCloudinary(publicId, next);
    }
    // Delete the product from the database
    await Product.destroy({ where: { id: req.params.id } });
    res.status(200).send({ message: `Product deleted successfully` });
  } catch (error) {
    console.error(error); // Log error for debugging
    res.status(500).json({ message: "Server error", error: error.message });
  }
});




exports.UpdateOneProduct = asyncHandler(async (req, res, next) => {
  try {
    // Fetch the category to get the public_id of the image
    const category = await Product.findByPk(req.params.id);
    // Use primary key (id)
    if (!category) {
      return next(
        new APIError(`No Category found for this id ${req.params.id}`, 404)
      );
    }
    // Handle imageCover deletion
    if (category.imageCover && typeof category.imageCover === "string") {
      category.imageCover = JSON.parse(category.imageCover);
    }
    if (category.imageCover?.name && req.body.imageCover) {
      const publicId = `TechLandBS/products/${category.imageCover.name}`;
      await deleteImageFromCloudinary(publicId, next);
    }
    // Update the category
    const updatedCategory = await Product.update(req.body, {
      where: { id: req.params.id },
      returning: true, // Returns the updated row
    });
    // if (updatedCategory[1] != 1) {
    //   return next(
    //     new APIError(`No product found for this id :  ${req.params.id}`, 404)
    //   );
    // }
    const categoryUpdated = await Product.findByPk(req.params.id);
    if (
      typeof categoryUpdated.imageCover === "string"
    ) {
      categoryUpdated.imageCover = JSON.parse(categoryUpdated.imageCover);
      await categoryUpdated.save();
    }
    res.status(200).json({
      message: `product Updated Successfully`,
      data: categoryUpdated,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
