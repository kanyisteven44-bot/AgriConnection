const router = require("express").Router();
const authController = require("../controllers/authcontroller");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/verify", authController.verifyAccount);
router.post("/send-code", authController.sendVerification);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;