const { check, validationResult, body } = require("express-validator");
const slugify = require("slugify");
const Validators = require("../middleWares/ValidatorMiddleWare");
const CategoryModel = require("../Models/BlogsModel");


exports.getBlogValidator = [
  check("id").isInt({ min: 1 }).withMessage("Blog ID must be a valid integer"), // Adjust this if using UUID
  Validators,
];

exports.createBlogValidator = [
  check("name")
    .notEmpty()
    .withMessage("Blog name is required")
    .isLength({ min: 3 })
    .withMessage("Blog name is too short")
    .isLength({ max: 100 })
    .withMessage("Blog name is too long")
    .custom(async (name, { req }) => {
      console.log("Name : ", req.body);
      const existingCategory = await CategoryModel.findOne({
        where: { name: name },
      });
      if (existingCategory) {
        // Will use the below as the error message
        throw new Error(`A Blog name already exists.`);
      }
    })
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  check("description")
    .notEmpty()
    .withMessage("Blog description is required")
    .isLength({ min: 10 })
    .withMessage("Too short Blog description")
    .isLength({ max: 2000 })
    .withMessage("Too Long Blog description"),
  Validators,
];

exports.updateBlogValidator = [
  check("id").isInt({ min: 1 }).withMessage("Blog ID must be a valid integer"), // Adjust for UUID if needed
  body("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Blog name is too short")
    .isLength({ max: 100 })
    .withMessage("Blog name is too long")
    .custom(async (name, { req }) => {
      const existingCategory = await CategoryModel.findOne({
        where: { name: name },
      });
      if (existingCategory && existingCategory.id != req.params.id) {
        // Will use the below as the error message
        throw new Error(`A Blog name already exists.`);
      }
    })
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  check("description")
    .notEmpty()
    .withMessage("Blog description is required")
    .isLength({ min: 10 })
    .withMessage("Too short Blog description")
    .isLength({ max: 2000 })
    .withMessage("Too Long Blog description"),
  Validators,
];

exports.deleteBlogValidator = [
  check("id")
    .isInt({ min: 1 })
    .withMessage("Blog ID must be a valid integer"), // Adjust for UUID if needed
  Validators,
];
