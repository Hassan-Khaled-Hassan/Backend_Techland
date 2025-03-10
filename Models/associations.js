const BlogsModel = require("./BlogsModel");
const Category = require("./categoryModel");
const Product = require("./ProductModel");

//============================================================================
//============================================================================
Product.belongsTo(Category, {
  foreignKey: "categoryID",
  as: "category", // Correct alias here
});

// In ClientTypeModel.js
Category.hasMany(Product, {
  foreignKey: "categoryID",
  as: "Products", // Correct alias here
});
//============================================================================

BlogsModel.belongsTo(Category, {
  foreignKey: "categoryID",
  as: "category", // Correct alias here
});

// In ClientTypeModel.js
Category.hasMany(BlogsModel, {
  foreignKey: "categoryID",
  as: "Blogs", // Correct alias here
});
//============================================================================



module.exports = { Product, Category, BlogsModel };
