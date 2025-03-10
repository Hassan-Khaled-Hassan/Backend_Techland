const { check, validationResult, body } = require("express-validator");
const slugify = require("slugify");
const Validators = require("../middleWares/ValidatorMiddleWare");
const CategoryModel = require("../Models/categoryModel");


exports.getCategoryValidator = [
  check("id")
    .isInt({ min: 1 })
    .withMessage("Category ID must be a valid integer"), // Adjust this if using UUID
  Validators,
];

exports.createCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 3 })
    .withMessage("Category name is too short")
    .isLength({ max: 100 })
    .withMessage("Category name is too long")
    .custom(async (name, { req }) => {
      console.log("Name : ", req.body);
      const existingCategory = await CategoryModel.findOne({
        where: { name: name },
      });
      if (existingCategory) {
        // Will use the below as the error message
        throw new Error(`A category with the name "${name}" already exists.`);
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

exports.updateCategoryValidator = [
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
      const existingCategory = await CategoryModel.findOne({
        where: { name: name },
      });
      console.log(existingCategory);
      console.log(req.params.id);
      if (existingCategory && existingCategory.id != req.params.id) {
        console.log("======================");
        // Will use the below as the error message
        throw new Error(`Category Name already exists.`);
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

exports.deleteCategoryValidator = [
  check("id")
    .isInt({ min: 1 })
    .withMessage("Category ID must be a valid integer"), // Adjust for UUID if needed
  Validators,
];
