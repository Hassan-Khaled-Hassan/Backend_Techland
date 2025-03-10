const express = require("express");
const {
  SignUpValidator,
  LoginValidator,
} = require("../Validators/AuthValidator");
const {
  SignUp,
  Login,
  ForgetPassword,
  VerifyResetCode,
  resetPassword,
  ProtectAuth
} = require("../Services/AuthLogic");


const router = express.Router();
// =============================
router.post("/signUp", SignUpValidator, SignUp);
router.post("/login", LoginValidator, Login);
router.post("/forgetPass", ForgetPassword);
router.post("/verifyResetCode", VerifyResetCode);
router.put("/resetPassword", resetPassword);





module.exports = router;
