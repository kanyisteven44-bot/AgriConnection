import { useEffect, useState } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";

function Marketplace() {
  const [crops, setCrops] = useState([]);

  useEffect(() => {
    API.get("/crops")
      .then(res => setCrops(res.data))
      .catch(err => console.error("Marketplace fetch error:", err));
  }, []);

  return (
    <div>
      <Sidebar />

      <div style={{ marginLeft: "240px", padding: "20px" }}>
        <h1>🌾 Marketplace</h1>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
          {crops.map((crop, i) => (
            <motion.div
              className="card"
              key={crop._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{ width: "220px" }}
            >
              <h3>{crop.name}</h3>
              <p>📍 {crop.location}</p>
              <p>💰 KES {crop.price}</p>
              <button>Buy Now</button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Marketplace;