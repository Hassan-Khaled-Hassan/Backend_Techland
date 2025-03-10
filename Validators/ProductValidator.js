const { check, validationResult, body } = require("express-validator");
const slugify = require("slugify");
const Validators = require("../middleWares/ValidatorMiddleWare");
const ProductModel = require("../Models/ProductModel");


exports.getProductValidator = [
  check("id")
    .isInt({ min: 1 })
    .withMessage("Product ID must be a valid integer"), // Adjust this if using UUID
  Validators,
];

exports.createProductValidator = [
  check("name")
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ min: 3 })
    .withMessage("Product name is too short")
    .isLength({ max: 100 })
    .withMessage("Product name is too long")
    .custom(async (name, { req }) => {
      console.log("Name : ", req.body);
      const existingCategory = await ProductModel.findOne({
        where: { name: name },
      });
      if (existingCategory) {
        // Will use the below as the error message
        throw new Error(`A Product with the name "${name}" already exists.`);
      }
    })
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  check("description")
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({ min: 20 })
    .withMessage("Too short Product description")
    .isLength({ max: 2000 })
    .withMessage("Too Long Product description"),
  Validators,
];

exports.updateProductValidator = [
  check("id")
    .isInt({ min: 1 })
    .withMessage("Category ID must be a valid integer"), // Adjust for UUID if needed
  body("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Category name is too short")
    .isLength({ max: 100 })
    .withMessage("Category name is too long")
    .custom(async (name, { req }) => {
      const existingCategory = await ProductModel.findOne({
        where: { name: name },
      });
      if (existingCategory && existingCategory.id != req.params.id) {
        // Will use the below as the error message
        throw new Error(`A Product with the name "${name}" already exists.`);
      }
    })
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  check("description")
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({ min: 20 })
    .withMessage("Too short Product description")
    .isLength({ max: 2000 })
    .withMessage("Too Long Product description"),
  Validators,
];

exports.deleteProductValidator = [
  check("id")
    .isInt({ min: 1 })
    .withMessage("Product ID must be a valid integer"), // Adjust for UUID if needed
  Validators,
];
