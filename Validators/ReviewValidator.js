const { check, validationResult, body } = require("express-validator");
const slugify = require("slugify");
const Validators = require("../middleWares/ValidatorMiddleWare");
const ReviewModel = require("../Models/ReviewModel");
// check => دي بتتشك بدل ال  query,param,body
exports.getReviewValidator = [
  check("id").isMongoId().withMessage("Brand ID is invalid"),
  Validators,
];
exports.createReviewValidator = [
  check("title").notEmpty().withMessage("Review title is required"),
  check("ProductID")
    .notEmpty()
    .withMessage("Review must be belong to a Product")
    .isMongoId()
    .withMessage("Invalid ID formate")
    .custom(async (ProductID, { req }) => 
      // check if logged user create review before
       ReviewModel.findOne({
        UserID: req.user._id,
        ProductID: req.body.ProductID,
      }).then((review) => {
        if (review) {
          // Throwing an error will be caught by express-validator
          return Promise.reject(
            new Error("You have already create a review before")
          );
        }
      })
    ),
  check("rating")
    .notEmpty()
    .withMessage("Review rating is required")
    .isNumeric()
    .withMessage("Review rating must be number.")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be between 1.0 : 5.0"),
  Validators,
];
exports.updateReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Brand ID is invalid")
    .custom(async (valueID, { req }) =>
      // check if logged user create review before
      ReviewModel.findById(valueID).then((review) => {
        if (!review) {
          // Throwing an error will be caught by express-validator
          return Promise.reject(
            new Error(`there is no any review for this id  : ${valueID}`)
          );
        }
        console.log(review.UserID);
        console.log(req.user._id);
        // we do review.UserID._id as we make populate to user id so it return as an object
        if (review.UserID._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error(
              `this review is not for you (${req.user.name}) so you can not update it.....`
            )
          );
        }
      })
    ),
  Validators,
];
exports.deleteReviewValidator = [
  check("id").isMongoId().withMessage("Brand ID is invalid")
      .custom(async (valueID, { req }) =>{
        // check if logged user create review before
        if (req.user.role === "user") {
          ReviewModel.findById(valueID).then((review) => {
            if (!review) {
              // Throwing an error will be caught by express-validator
              return Promise.reject(
                new Error(`there is no any review for this id  : ${valueID}`)
              );
            }
            console.log(review.UserID);
            console.log(req.user._id);
            if (review.UserID._id.toString() !== req.user._id.toString()) {
              return Promise.reject(
                new Error(
                  `this review is not for you (${req.user.name}) so you can not update it.....`
                )
              );
            }
          });
        }
      }
      
    ),
  Validators,
];
