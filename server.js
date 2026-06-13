require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/agriconnection")
  .then(() => console.log("Connected to MongoDB Atlas ✅"))
  .catch(err => console.error("MongoDB Connection Error ❌", err));

app.get("/", (req, res) => {
  res.send("AgriConnection API Running 🚀");
});

// Routes
app.use("/api/auth", require("./backend/src/routes/authRoutes"));
app.use("/api/crops", require("./backend/src/routes/croproutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});