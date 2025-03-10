const { DataTypes } = require("sequelize");
const sequelize = require("../Database/database"); // Assuming your DB connection is here

const Category = sequelize.define(
  "categories",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: [true, "category name must be unique"], // Ensure uniqueness
      validate: {
        notEmpty: true, // Ensures the field is not empty
        len: [3, 100], // Min and Max length
      },
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image: {
      type: DataTypes.JSON,
      allowNull: true,
      get() {
        // Parse the JSON string into a JavaScript object when retrieved
        const rawValue = this.getDataValue("image");
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        // Ensure the value is stored as a JSON string
        this.setDataValue("image", JSON.stringify(value));
      },
    },
  },
  {
    timestamps: true, // Add createdAt, updatedAt columns automatically
    tableName: "categories", // Define the table name
  }
);

module.exports = Category;
