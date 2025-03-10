const express = require("express");
const {
  resizeImage,
  uploadProductImages,
  CreateCategory,
  GetAllCategory,
  GetOneCategory,
  UpdateOneCategory,
  deleteOneCategory,
} = require("../Services/CategoryLogic");

const {
  createCategoryValidator,
  deleteCategoryValidator,
  getCategoryValidator,
  updateCategoryValidator,
} = require("../Validators/CategoryValidator");

const router = express.Router();
router.get("/Categories", GetAllCategory);
router.get("/Categories/:id",getCategoryValidator, GetOneCategory);
router.post(
  "/addCategory",
  uploadProductImages,
  createCategoryValidator,
  resizeImage,
  CreateCategory
);
router.delete("/deleteCategory/:id",deleteCategoryValidator, deleteOneCategory);
router.put(
  "/updateCategory/:id",
  uploadProductImages,
  updateCategoryValidator,
  resizeImage,
  UpdateOneCategory
);
module.exports = router;
