const JWT = require("jsonwebtoken");

const createToken = (payload) =>
  JWT.sign({ userId: payload }, process.env.JWT_KEY, {
    expiresIn: process.env.IWT_EXPIRE,
  });

module.exports = createToken;
