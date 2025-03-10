const express = require("express");
const {
  resizeImage,
  uploadProductImages,
  CreateBlog,
  GetAllBlogs,
  GetOneBlog,
  UpdateOneBlog,
  deleteOneBlog
} = require("../Services/BlogLogic");

const {
  createBlogValidator,
  getBlogValidator,
  deleteBlogValidator,
  updateBlogValidator
} = require("../Validators/BlogsValidator");

const router = express.Router();
router.get("/Blogs", GetAllBlogs);
router.get("/Blogs/:id", getBlogValidator, GetOneBlog);
router.post(
  "/addBlog",
  uploadProductImages,
  createBlogValidator,
  resizeImage,
  CreateBlog
);
router.delete("/deleteBlog/:id", deleteBlogValidator, deleteOneBlog);
router.put(
  "/updateBlog/:id",
  uploadProductImages,
  updateBlogValidator,
  resizeImage,
  UpdateOneBlog
);
module.exports = router;
