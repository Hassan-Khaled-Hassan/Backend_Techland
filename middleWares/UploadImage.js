/* eslint-disable import/no-extraneous-dependencies */
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("cloudinary").v2;
const APIError = require("../Utils/apiError");

// =========== image handle storage ==================
const multerOptions = () => {
  /// 1- disk storage solution
  const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/categories");
    },
    filename: function (req, file, cb) {
      //`category-${uuidv4()}-${Date.now()}.jpeg`
      const ext = file.mimetype.split("/")[1];
      const filename = `category-${uuidv4()}-${Date.now()}.${ext}`;
      cb(null, filename);
    },
  });
  //const upload = multer({ storage: multerStorage, fileFilter: fileFilter });
  // -----------------------------------------
  //2- memory storage solution used when we need to make
  //a preprocessing on image as it save image as a buffer
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



exports.uploadSingleImage = (fieldName) => 
  multerOptions().single(fieldName);

exports.uploadMixOfImages = (arrayOfImages) =>
  multerOptions().fields(arrayOfImages);
