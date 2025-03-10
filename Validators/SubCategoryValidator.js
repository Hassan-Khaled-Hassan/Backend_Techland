const { check, validationResult, body } = require("express-validator");
const slugify = require("slugify");
const Validators = require("../middleWares/ValidatorMiddleWare");

exports.getSubCategoryValidator = [
  check("id").isMongoId().withMessage("SubCategory ID is invalid"),
  Validators,
];
exports.createSubCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("SubCategory name is required")
    .isLength({ min: 3 })
    .withMessage("Too short subcategory name")
    .isLength({ max: 32 })
    .withMessage("Too long subcategory name")
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  check("category")
    .notEmpty()
    .withMessage("category ID is required")
    .isMongoId()
    .withMessage("Category ID is invalid"),
  Validators,
];
exports.updateSubCategoryValidator = [
  check("id").isMongoId().withMessage("SubCategory ID is invalid"),
  body("name")
    .optional()
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  Validators,
];
exports.deleteSubCategoryValidator = [
  check("id").isMongoId().withMessage("SubCategory ID is invalid"),
  Validators,
];
