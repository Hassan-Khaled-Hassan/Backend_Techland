const express = require("express");
const {
  resizeImage,
  uploadProductImages,
  CreateProduct,
  GetAllProducts,
  GetOneProduct,
  deleteOneProduct,
  UpdateOneProduct,
} = require("../Services/ProductsLogic");

const {
  createProductValidator,
  deleteProductValidator,
  getProductValidator,
  updateProductValidator
} = require("../Validators/ProductValidator");

const router = express.Router();
router.get("/Products", GetAllProducts);
router.get("/Products/:id",getProductValidator, GetOneProduct);
router.post(
  "/addProduct",
  uploadProductImages,
  createProductValidator,
  resizeImage,
  CreateProduct
);
router.delete("/deleteProduct/:id",deleteProductValidator, deleteOneProduct);
router.put(
  "/updateProduct/:id",
  uploadProductImages,
  updateProductValidator,
  resizeImage,
  UpdateOneProduct
);
module.exports = router;
