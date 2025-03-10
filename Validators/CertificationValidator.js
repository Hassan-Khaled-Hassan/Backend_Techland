const { check, validationResult, body } = require("express-validator");
const slugify = require("slugify");
const Validators = require("../middleWares/ValidatorMiddleWare");
const CategoryModel = require("../Models/CertificationModel");

// For primary keys in SQL databases, typically integers or UUIDs are used. Adjust the validation as per your database schema.

exports.getCertificationValidator = [
  check("id")
    .isInt({ min: 1 })
    .withMessage("Certification ID must be a valid integer"), // Adjust this if using UUID
  Validators,
];

exports.createCertificationValidator = [
  check("name")
    .notEmpty()
    .withMessage("Certification name is required")
    .isLength({ min: 3 })
    .withMessage("Certification name is too short")
    .isLength({ max: 32 })
    .withMessage("Certification name is too long")
    .custom(async (name, { req }) => {
      console.log("Name : ", req.body);
      const existingCategory = await CategoryModel.findOne({
        where: { name: name },
      });
      console.log(existingCategory);
      if (existingCategory) {
        // Will use the below as the error message
        throw new Error(
          `A Certification name already exists.`
        );
      }
    })
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  check("description")
    .notEmpty()
    .withMessage("Certification description is required")
    .isLength({ min: 20 })
    .withMessage("Too short Certification description")
    .isLength({ max: 2000 })
    .withMessage("Too Long Certification description"),
  Validators,
];

exports.updateCertificationValidator = [
  check("id")
    .isInt({ min: 1 })
    .withMessage("Certification ID must be a valid integer"), // Adjust for UUID if needed
  body("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Certification name is too short")
    .isLength({ max: 32 })
    .withMessage("Certification name is too long")
    .custom(async (name , {req}) => {
      const existingCategory = await CategoryModel.findOne({
        where: { name: name },
      });
      if (existingCategory && existingCategory.id != req.params.id) {
        // Will use the below as the error message
        throw new Error(`A Certification name already exists.`);
      }
    })
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  check("description")
    .notEmpty()
    .withMessage("Certification description is required")
    .isLength({ min: 20 })
    .withMessage("Too short Certification description")
    .isLength({ max: 2000 })
    .withMessage("Too Long Certification description"),
  Validators,
];

exports.deleteCertificationValidator = [
  check("id")
    .isInt({ min: 1 })
    .withMessage("Certification ID must be a valid integer"), // Adjust for UUID if needed
  Validators,
];
