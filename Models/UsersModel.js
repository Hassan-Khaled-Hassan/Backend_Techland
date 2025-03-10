const { DataTypes } = require("sequelize");
const sequelize = require("../Database/database"); // Assuming your DB connection is here
const bcrypt = require("bcryptjs");

const User = sequelize.define(
  "Users",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "User name is required" },
        notEmpty: { msg: "User name cannot be empty" },
      },
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: "Email must be unique",
      },
      validate: {
        notNull: { msg: "User email is required" },
        isEmail: { msg: "Must be a valid email address" },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "User password is required" },
        len: {
          args: [6,],
          msg: "Password must be at least 6 characters long",
        },
      },
    },
    role: {
      type: DataTypes.ENUM("user", "admin", "manager"),
      defaultValue: "user",
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    phone: {
      type: DataTypes.STRING,
    },
    PasswordChangedAt: {
      type: DataTypes.DATE,
    },
    PasswordResetCode: {
      type: DataTypes.STRING,
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
    },
    passwordResetVerified: {
      type: DataTypes.BOOLEAN,
    },
    profileImage: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    timestamps: true, // Add createdAt, updatedAt columns automatically
    tableName: "Users", // Define the table name
    hooks: {
      beforeSave: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      // beforeUpdate: async (user) => {
      //   if (user.changed("password")) {
      //     console.log("beforeUpdate Hook Running ✅");
      //     user.password = await bcrypt.hash(user.password, 12);
      //   }
      // },
    },
  }
);

module.exports = User;
