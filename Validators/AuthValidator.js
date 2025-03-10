/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable arrow-body-style */
const { check, validationResult, body } = require("express-validator");
const slugify = require("slugify");
const bcrypt = require("bcryptjs");
const Validators = require("../middleWares/ValidatorMiddleWare");
const UserModel = require("../Models/UsersModel");

exports.SignUpValidator = [
  check("name")
    .notEmpty()
    .withMessage("User name is required")
    .isLength({ min: 3 })
    .withMessage("Too short User name")
    .custom((value, { req }) => {
      // console.log("--------1")
      req.body.slug = slugify(value);
      // console.log(req.body);
      return true;
    }),

  check("email")
    .notEmpty()
    .withMessage("User email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (name) => {
      const user = await UserModel.findOne({
        where: { name: name },
      });
      if (user) {
        // Throwing an error will be caught by express-validator
        return Promise.reject(new Error("Email is already Existed"));
      }
    }),

  check("password")
    .notEmpty()
    .withMessage("User password is required")
    .isLength({ min: 8 })
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
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number only accepted EG and SA")
    .custom(async (value) => {
      const user = await UserModel.findOne({
        where: { phone: value },
      });
      if (user) {
        // Throwing an error will be caught by express-validator
        return Promise.reject(new Error("Mobile Number is already Existed"));
      }
    }),

  Validators,
];
exports.VerifyValidator = [
  check("email")
    .notEmpty()
    .withMessage("User email is required")
    .isEmail()
    .withMessage("Invalid email address"),
  check("code")
    .notEmpty()
    .withMessage("User password is required"),
  Validators,
];

exports.LoginValidator = [
  check("email")
    .notEmpty()
    .withMessage("User email is required")
    .isEmail()
    .withMessage("Invalid email address"),
  check("password")
    .notEmpty()
    .withMessage("User password is required")
    .isLength({ min: 6 })
    .withMessage("Too short User password"),
  Validators,
];

