const express = require("express");
const userController = require("../controllers/UserController");
const {
  authAdminMiddleware,
  authUserMiddleware,
} = require("../middleware/Auth.middleware");
const uploadImage = require("../middleware/uploadImage.middleware");
const { validateRequest } = require("../middleware/validateRequest.middleware");
const { LoginSchema, SignupSchema } = require("../validations/auth");
const router = express.Router();

router.post(
  "/sign-up",
  uploadImage.single("avatar"),
  validateRequest(SignupSchema, "body"),
  userController.createUser
);
router.post(
  "/sign-in",
  validateRequest(LoginSchema, "body"),
  userController.loginUser
);
router.put(
  "/update/:id",
  uploadImage.single("avatar"),
  userController.updateUser
);
router.delete(
  "/delete-user/:id",
  authAdminMiddleware,
  userController.deleteUser
);
router.get("/get-all", userController.getAllUser);
router.get(
  "/get-details/:id",
  authUserMiddleware,
  userController.getDetailsUser
);
router.get("/teachers", userController.getTeachers);
// router.post('/refresh_token', userController.refreshToken);
module.exports = router;
