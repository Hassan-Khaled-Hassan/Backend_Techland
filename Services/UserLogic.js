/* eslint-disable import/no-extraneous-dependencies */
const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("cloudinary").v2;
const bcrypt = require("bcryptjs");
const UserModel = require("../Models/UsersModel");
const { uploadSingleImage } = require("../middleWares/uploadCloudImages");
const APIError = require("../Utils/apiError");
const createToken = require("../Utils/createToke");
const ApiFeatures = require("../Utils/ApiFeatures");
// upload single image
exports.uploadUserImage = uploadSingleImage("profileImage");
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
// used to make preprocessing using sharp library
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
        "TechLandBS/Users",
        imageCoverFileName
      );
      req.body.profileImage = {
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
//================================================================

// @desc    post list of Users
// @route   post /api/v1/Users/
// @access  Public
exports.createUser = asyncHandler(async (req, res) => {
  const Document = await UserModel.create(req.body);
  res.status(201).json({ data: Document });
});

// @desc    Get list of Users
// @route   GET /api/v1/Users
// @access  Public
exports.getUsers = asyncHandler(async (req, res) => {
  const countDocuments = await UserModel.count();
  const apiFeatures = new ApiFeatures(UserModel, req.query)
    .Pagination(countDocuments)
    .Filter()
    .Search("User") // Specify the model name for search
    .limitField()
    .Sort();

  const clients = await apiFeatures.buildQuery();
  const parsedClients = clients.map((client) => {
    if (typeof client.profileImage === "string") {
      client.profileImage = JSON.parse(client.profileImage);
    }
    return client;
  });

  res.status(200).json({
    results: parsedClients.length,
    PaginationResult: apiFeatures.PaginationResult,
    data: parsedClients,
  });
});
// =========================================================================
// @desc    Get unique User
// @route   GET /api/v1/Users/Specific-User/:id
// @access  Public
exports.getUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  //execute query
  const Document = await UserModel.findByPk(id);
  if (typeof Document.profileImage === "string") {
    Document.profileImage = JSON.parse(Document.profileImage);
    await Document.save();
  }

  if (!Document) {
    return next(new APIError(`No User found for this id ${id}`, 404));
    // eslint-disable-next-line no-else-return
  } else {
    res.status(200).json({ status: "success", data: Document });
  }
});

// ==========================================================================
// @desc    Update unique Users
// @route   GET /api/v1/Users/Edit-User/:id
// @access  private
exports.EditUser = asyncHandler(async (req, res, next) => {
  const category = await UserModel.findByPk(req.params.id);
  // Use primary key (id)
  if (!category) {
    return next(
      new APIError(`No Category found for this id ${req.params.id}`, 404)
    );
  }
  const updatedCategory = await UserModel.update(req.body, {
    where: { id: req.params.id },
    returning: true, // Returns the updated row
  });
  // if (updatedCategory[1] != 1) {
  //   return next(
  //     new APIError(`No product found for this id :  ${req.params.id}`, 404)
  //   );
  // }
  const categoryUpdated = await UserModel.findByPk(req.params.id);

  res
    .status(200)
    .json({ message: `User Updated Successfully`, data: categoryUpdated });
});
// ==========================================================================
exports.updateUserPass = asyncHandler(async (req, res, next) => {
  const Document = await UserModel.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      PasswordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  if (!Document) {
    return next(
      new APIError(`No User found for this id :  ${req.params.id}`, 404)
    );
  }
  res
    .status(200)
    .json({ message: `User Updated Successfully`, data: Document });
});
// ==========================================================================
// @desc    Delete unique Users
// @route   Delete /api/v1/Users/Delete-Users/:id
// @access  private
exports.DeleteUser = asyncHandler(async (req, res, next) => {
  const Document = await UserModel.findByPk(req.params.id);
  if (!Document) {
    return next(new APIError(`No User found for this id`, 404));
  }
  // Delete the product from the database
  await UserModel.destroy({ where: { id: req.params.id } });
  res.status(200).send({ message: `User deleted Successfully` });
});

// @desc    Get logged user data
// @route   GET /api/v1/Users/Specific-User/:id
// @access  Public
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user.id;
  next();
});

exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  // console.log(req.body);
  const UserResult = await UserModel.findByPk(req.user.id);
  if (
    !UserResult ||
    !(await bcrypt.compare(req.body.currentPass, UserResult.password))
  ) {
    return next(new APIError("Incorrect  password, Please check again", 401));
  }
  // Hash the new password before updating
  // const hashedPassword = await bcrypt.hash(req.body.password, 12);
  // console.log(hashedPassword);
  // const UserData = await UserModel.update(
  //   {
  //     password: req.body.password,
  //     PasswordChangedAt: Date.now(),
  //   },
  //   {
  //     where: { id: req.user.id },
  //     individualHooks: true,
  //   }
  // );
    UserResult.password = req.body.password;
    console.log("New Hashed Password:", UserResult.password);
    UserResult.PasswordChangedAt = new Date();

    // Save the updated user
    await UserResult.save();
  const token = createToken(req.user.id);
  res
    .status(200)
    .json({
      message: `User Password Updated Successfully`,
      token,
    });
});

exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  if (typeof req.user.profileImage === "string") {
    req.user.profileImage = JSON.parse(req.user.profileImage);
    await req.user.save();
  }
   const publicId = `TechLandBS/Users/${req.user.profileImage.name}`;
  if (publicId && req.user.profileImage.name && req.body.profileImage) {
    await deleteImageFromCloudinary(publicId);
  }
  const UserData = await UserModel.update(req.body, {
    where: { id: req.user.id },
    returning: true, // Returns the updated row
  });
  const token = createToken(UserData._id);
  const categoryUpdated = await UserModel.findByPk(req.user.id);
  res
    .status(200)
    .json({
      message: `User Updated Successfully`,
      data: categoryUpdated,
      token,
    });
});

// @desc    Deactivate logged user
// @route   DELETE /api/v1/users/deleteMe
// @access  Private/Protect
exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
  await UserModel.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({ status: "Success" });
});
