const { DataTypes } = require("sequelize");
const sequelize = require("../Database/database"); // Assuming your DB connection is here

const Blog = sequelize.define(
  "Blogs",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: [true, "Blog name must be unique"], // Ensure uniqueness
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
    Benefits: {
      type: DataTypes.JSON,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue("Benefits");
        // Parse the stringified JSON when retrieving
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        // If it's already an object, don't stringify it again
        const parsedValue =
          typeof value === "string" ? JSON.parse(value) : value;
        this.setDataValue("Benefits", JSON.stringify(parsedValue)); // Store as a stringified JSON
      },
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
    tableName: "Blogs", // Define the table name
  }
);

module.exports = Blog;
