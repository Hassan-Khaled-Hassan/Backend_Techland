const express = require("express");
const {
  createUser,
  getUsers,
  getUser,
  EditUser,
  DeleteUser,
  uploadUserImage,
  resizeImage,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUserData,
} = require("../Services/UserLogic");

const {
  createUserValidator,
  getUserValidator,
  updateUserValidator,
  deleteUserValidator,
  updateUserPasswordValidator,
  updateLoggedUserValidator,
} = require("../Validators/UserValidator");
const { ProtectAuth, isAllowedTo } = require("../Services/AuthLogic");

const router = express.Router();


router.use(ProtectAuth);

// logged user updateLoggedUserData
router.get(
  "/UserData",
  getLoggedUserData,
  getUser
);
router.put(
  "/changePass",
  updateUserPasswordValidator,
  updateLoggedUserPassword
);

router.put(
  "/changeUserData",
  uploadUserImage,
  updateLoggedUserValidator,
  resizeImage,
  updateLoggedUserData
);
router.delete("/deleteMe", deleteLoggedUserData);
// =============================
// Admin 
// router.use(isAllowedTo("admin_System", "admin_Place"));
router.post(
  "/createUser",
  uploadUserImage,
  resizeImage,
  createUserValidator,
  createUser
);
router.get("/AllUsers", getUsers);
router.get(
  "/Specific-User/:id",
  getUserValidator,
  getUser
);
router.put(
  "/Edit-UserData/:id",
  uploadUserImage,
  resizeImage,
  updateUserValidator,
  EditUser
);
// router.put("/Edit-UserPass/:id",updateUserPasswordValidator, updateUserPass);
router.delete(
  "/Delete-User/:id",
  deleteUserValidator,
  DeleteUser
);
// router.put("/EditUserRoles", updateUserRole);

module.exports = router;

//==