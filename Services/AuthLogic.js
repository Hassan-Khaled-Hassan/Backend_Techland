/* eslint-disable import/no-extraneous-dependencies */
const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const UserModel = require("../Models/UsersModel");
const APIError = require("../Utils/apiError");
const SendEmail = require("../Utils/SendEmail");
const createToken = require("../Utils/createToke");
const MyHtmlCode = require("../Utils/MyHtmlCode");
const { Op } = require("sequelize");

exports.SignUp = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone , slug } = req.body;
  // create user
  const UserData = await UserModel.create({
    name,
    email,
    password,
    phone,
    slug,
  });
  // create token
  const token = createToken(UserData.id);

  res.status(201).json({ data: UserData, token: token });
});

exports.Login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  // create user
  const UserData = await UserModel.findOne({ where: { email } });
  console.log(UserData.password);
  console.log(password);
  const reslt = await bcrypt.compare(password, UserData.password);
  console.log(reslt);

  if (!UserData || !(await bcrypt.compare(password, UserData.password))) {
    return next(new APIError("Incorrect email or password", 401));
  }
  // create token
  const token = createToken(UserData.id);

  res.status(200).json({ data: UserData, token: token });
});

exports.ProtectAuth = asyncHandler(async (req, res, next) => {
  // 1 check if token existed , if it did it
  console.log(req.headers);
  let token;
  if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    console.log(token);
  }
  if (!token) {
    return next(
      new APIError(
        "you are not authorized please login to access this route",
        401
      )
    );
  }
  // 2 check if it valid and not expired
  const decoded = JWT.verify(token, process.env.JWT_KEY);
  console.log(decoded);
  // 3 check if user exist
  const UserData = await UserModel.findByPk(decoded.userId);
  if (!UserData) {
    return next(new APIError("there is no user with the specified token", 401));
  }
  // 4 check if user changed password after token created or not
  if (UserData.PasswordChangedAt) {
    const PasswordChangedTimeStamp = parseInt(
      UserData.PasswordChangedAt.getTime() / 1000,
      10
    );
    console.log(PasswordChangedTimeStamp, decoded.iat);
    // mean password changed after token created
    if (PasswordChangedTimeStamp > decoded.iat) {
      return next(
        new APIError(
          "user recently change password. please login again.....",
          401
        )
      );
    }
  }
  req.user = UserData;
  next();
});

exports.isAllowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // access roles
    // access registered users using req.user
    console.log(roles);
    if (!roles.includes(req.user.role)) {
      return next(new APIError("you are not allowed to perform it", 403));
    }
    next();
  });

exports.ForgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  // check if user existed
  const UserData = await UserModel.findOne({ where: { email } });
  if (!UserData) {
    return next(
      new APIError(`there is no user with the specified email : ${email}`, 401)
    );
  }
  // if user exist generate random code from 6 digits and save it to database
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  console.log(resetCode);
  console.log(hashResetCode);
  // save hashResetCode to db
  UserData.PasswordResetCode = hashResetCode;
  // Add expiration time for password reset code (10 min)
  UserData.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  UserData.passwordResetVerified = false;
  await UserData.save();
  // send it to user via email
  const htmlCode = MyHtmlCode(
    UserData.name,
    resetCode,
    process.env.SUPPORT_MAIL
  );
    try {
      await SendEmail({
        email: UserData.email,
        subject: "Your password reset code (valid for 10 min)",
        htmlCode,
      });
    } catch (err) {
      UserData.PasswordResetCode = undefined;
      UserData.passwordResetExpires = undefined;
      UserData.passwordResetVerified = undefined;

      await UserData.save();
      return next(
        new APIError(`There is an error in sending email : ${err}`, 500)
      );
    }
  res.status(200).json({ status: 'Success',message: "reset code sent to your mail successfully" });
});


exports.VerifyResetCode = asyncHandler(async (req, res, next) => {
  const { resetCode } = req.body;
  // create user
  // 1) Get user based on reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  const UserData = await UserModel.findOne({
    where: {
      PasswordResetCode: hashedResetCode,
      passwordResetExpires: { [Op.gt]: new Date() }, // Sequelize operator for greater than current time
    },
  });
  console.log(UserData);
  if (!UserData) {
    return next(new APIError("Reset code invalid or expired"));
  }

  // 2) Reset code valid
  UserData.passwordResetVerified = true;
  await UserData.save();
  console.log(UserData);


  res.status(200).json({
    status: "Success",
  });
});

// @desc    Reset password
// @route   POST /api/v1/auth/resetPassword
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { email, newPassword } = req.body;
  // 1) Get user based on email
  const UserData = await UserModel.findOne({ where: { email } });
  if (!UserData) {
    return next(new APIError(`There is no user with email ${email}`, 404));
  }

  // 2) Check if reset code verified
  if (!UserData.passwordResetVerified) {
    return next(new APIError("Reset code not verified", 400));
  }

  UserData.password = newPassword;
  UserData.passwordResetCode = undefined;
  UserData.passwordResetExpires = undefined;
  UserData.passwordResetVerified = undefined;

  await UserData.save();

  // 3) if everything is ok, generate token
  const token = createToken(UserData.id);
  res.status(200).json({ token });
});
