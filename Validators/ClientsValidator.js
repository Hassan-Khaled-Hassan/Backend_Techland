const { check, validationResult, body } = require("express-validator");
const slugify = require("slugify");
const Validators = require("../middleWares/ValidatorMiddleWare");
const ClientsModel = require("../Models/ClientsModel");

// For primary keys in SQL databases, typically integers or UUIDs are used. Adjust the validation as per your database schema.

exports.getClientValidator = [
  check("id")
    .isInt({ min: 1 })
    .withMessage("Client ID must be a valid integer"), // Adjust this if using UUID
  Validators,
];
exports.createClientValidator = [
  check("name")
    .notEmpty()
    .withMessage("Client name is required")
    .isLength({ min: 3 })
    .withMessage("Client name is too short")
    .isLength({ max: 32 })
    .withMessage("Client name is too long")
    .custom(async (name, { req }) => {
      // console.log("Name : ", req.body);
      const existingCategory = await ClientsModel.findOne({
        where: { name: name },
      });
      if (existingCategory) {
        // Will use the below as the error message
        throw new Error(`A Client with this name  already exists.`);
      }
    })
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  Validators,
];
exports.updateClientValidator = [
  check("id")
    .isInt({ min: 1 })
    .withMessage("Client ID must be a valid integer"), // Adjust for UUID if needed
  body("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Client name is too short")
    .isLength({ max: 32 })
    .withMessage("Client name is too long")
    .custom(async (name , {req}) => {
      const existingCategory = await ClientsModel.findOne({
        where: { name: name },
      });
      if (existingCategory && existingCategory.id != req.params.id) {
        // Will use the below as the error message
        throw new Error(`A Client with the name "${name}" already exists.`);
      }
    })
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  Validators,
];
exports.deleteClientValidator = [
  check("id")
    .isInt({ min: 1 })
    .withMessage("Client ID must be a valid integer"), // Adjust for UUID if needed
  Validators,
];
