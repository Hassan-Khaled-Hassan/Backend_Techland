const { check, validationResult, body } = require("express-validator");
const slugify = require("slugify");
const Validators = require("../middleWares/ValidatorMiddleWare");

// check => دي بتتشك بدل ال  query,param,body
exports.getBrandValidator = [
  check("id").isMongoId().withMessage("Brand ID is invalid"),
  Validators,
];
exports.createBrandValidator = [
  check("name")
    .notEmpty()
    .withMessage("Brand name is required")
    .isLength({ min: 3 })
    .withMessage("Too short Brand name")
    .isLength({ max: 32 })
    .withMessage("Too long Brand name")
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  Validators,
];
exports.updateBrandValidator = [
  check("id").isMongoId().withMessage("Brand ID is invalid"),
  body("name").optional().custom((value,{req})=>{
    req.body.slug = slugify(value);
    return true;
  }),
  Validators,
];
exports.deleteBrandValidator = [
  check("id").isMongoId().withMessage("Brand ID is invalid"),
  Validators,
];
