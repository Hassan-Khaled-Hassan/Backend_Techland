const { DataTypes } = require("sequelize");
const sequelize = require("../Database/database"); // Assuming your DB connection is here

const Certification = sequelize.define(
  "Certification",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: [true, "Certification name must be unique"], // Ensure uniqueness
      validate: {
        notEmpty: true, // Ensures the field is not empty
        len: [3, 32], // Min and Max length
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
    },
  },
  {
    timestamps: true, // Add createdAt, updatedAt columns automatically
    tableName: "Certification", // Define the table name
  }
);

module.exports = Certification;
