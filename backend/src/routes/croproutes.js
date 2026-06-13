const router = require("express").Router();
const cropController = require("../controllers/cropcontroller"); // Ensure lowercase
const authMiddleware = require("../middleware/auth");

// Public route to get all crops
router.get("/", cropController.getAllCrops);

// Protected route to create a new crop listing (only authenticated users can post)
router.post("/", authMiddleware, cropController.createCrop);

module.exports = router;