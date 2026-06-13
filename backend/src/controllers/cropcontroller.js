const Crop = require("../models/crop");

// Get all crops
exports.getAllCrops = async (req, res) => {
  try {
    const crops = await Crop.find();
    res.json(crops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new crop listing
exports.createCrop = async (req, res) => {
  try {
    const { name, location, price } = req.body;

    // In a real application, you'd likely associate the crop with the logged-in user (farmer)
    // const farmerId = req.user.id; // Assuming auth middleware adds user to req

    const newCrop = await Crop.create({
      name,
      location,
      price,
      // farmer: farmerId,
    });

    res.status(201).json({ message: "Crop listed successfully", crop: newCrop });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};