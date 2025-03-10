const { DataTypes } = require("sequelize");
const sequelize = require("../Database/database");

const Clients = sequelize.define(
  "Clients",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 32],
      },
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "Clients",
  }
);

module.exports = Clients;
