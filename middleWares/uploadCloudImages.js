/* eslint-disable import/no-extraneous-dependencies */
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("cloudinary").v2;
const APIError = require("../Utils/apiError");
require("dotenv").config({ path: "config.env" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const multerOptions = () => {
  const storage = multer.memoryStorage();
  // to check if this  file is image or not
  const fileFilter = function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new APIError("your file should be image", 400), false);
    }
  };
  const upload = multer({ storage: storage, fileFilter: fileFilter });
  return upload;
};

exports.uploadSingleImage = (fieldName) => multerOptions().single(fieldName);

exports.uploadMixOfImages = (arrayOfImages) =>
  multerOptions().fields(arrayOfImages);