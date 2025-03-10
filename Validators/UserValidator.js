/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable arrow-body-style */
const { check, validationResult, body } = require("express-validator");
const slugify = require("slugify");
const bcrypt = require("bcryptjs");
const Validators = require("../middleWares/ValidatorMiddleWare");
const UserModel = require("../Models/UsersModel");

// Validators for handling various operations
exports.getUserValidator = [
  check("id").isInt({ min: 1 }).withMessage("User ID must be a valid integer"), // Adjust this if using UUID

  Validators,
];

exports.createUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("User name is required")
    .isLength({ min: 3 })
    .withMessage("Too short User name")
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),

  check("email")
    .notEmpty()
    .withMessage("User email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom((email) => {
      // Return the promise to handle it correctly
      return UserModel.findOne({
        where: { email: email },
      }).then((user) => {
        if (user) {
          // Throwing an error will be caught by express-validator
          return Promise.reject(new Error("Email is already Existed"));
        }
      });
    }),

  check("password")
    .notEmpty()
    .withMessage("User password is required")
    .isLength({ min: 6 })
    .withMessage("Too short User password")
    .custom((value, { req }) => {
      if (value !== req.body.passwordConfirm) {
        throw new Error(`password Confirmation incorrect`);
      }
      return true;
    }),
  check("passwordConfirm")
    .notEmpty()
    .withMessage("User passwordConfirm is required"),

  check("profileImage").optional(),
  check("role").notEmpty().withMessage("User Role is required"),
  check("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Invalid phone number only accepted EG and SA"),

  Validators,
];

exports.updateUserValidator = [
  check("id").isInt({ min: 1 }).withMessage("User ID must be a valid integer"), // Adjust this if using UUID

  body("name")
    .optional()
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),

  check("email")
    .notEmpty()
    .withMessage("User email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom((email , { req }) => {
      // Return the promise to handle it correctly
      return UserModel.findOne({
        where: { email: email },
      }).then((user) => {
        if (user && user.id != req.params.id) {
          // Throwing an error will be caught by express-validator
          return Promise.reject(new Error("Email is already Existed"));
        }
      });
    }),

  check("profileImage").optional(),
  check("role").notEmpty().withMessage("User Role is required"),
  check("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Invalid phone number only accepted EG and SA"),
  Validators,
];
exports.updateUserPasswordValidator = [
  check("currentPass").notEmpty().withMessage("SET Current user Password"),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("User passwordConfirm is required"),

  check("password")
    .notEmpty()
    .withMessage("SET user password")
    .isLength({ min: 8 })
    .withMessage("Too short User password")
    .custom((value, { req }) => {
      if (value !== req.body.passwordConfirm) {
        throw new Error(`password Confirmation incorrect`);
      }
      return true;
    }),
  Validators,
];

exports.deleteUserValidator = [
  check("id").isInt({ min: 1 }).withMessage("User ID must be a valid integer"), // Adjust this if using UUID

  Validators,
];


// logged user ------------------------
exports.updateLoggedUserValidator = [
  body("name")
    .optional()
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),

  check("email")
    .notEmpty()
    .withMessage("User email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom((value, { req }) => {
      // console.log(req.user.email);
      if (req.user.email === value) {
        return true;
      }
      // Return the promise to handle it correctly
      return UserModel.findOne({ email: value }).then((user) => {
        if (user) {
          // Throwing an error will be caught by express-validator
          return Promise.reject(new Error("Email is already Existed"));
        }
      });
    }),

  check("profileImage").optional(),
  check("role").optional(),

  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number only accepted EG and SA"),
  Validators,
];