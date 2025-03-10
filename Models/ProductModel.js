const { DataTypes } = require("sequelize");
const sequelize = require("../Database/database"); // Assuming your DB connection is here

const Product = sequelize.define(
  "Products",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: "Product name must be unique",
      }, // Ensure uniqueness
      validate: {
        notEmpty: true, // Ensures the field is not empty
        len: {
          args: [3, 100],
          msg: "Product name must be between 3 and 32 characters",
        }, // Min and Max length
      },
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    categoryID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "categories", // Assuming the table name is Categories
        key: "id",
      },
      validate: {
        notNull: { msg: "Category ID is required" },
      },
    },
    imageCover: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        notNull: { msg: "Product image cover is required" },
      },
    },
     URL_Link: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true, // Add createdAt, updatedAt columns automatically
    tableName: "Products", // Define the table name
  }
);

module.exports = Product;
