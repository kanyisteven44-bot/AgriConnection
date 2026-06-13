import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";

function Dashboard() {
  return (
    <div>
      <Sidebar />

      <div style={{ marginLeft: "240px", padding: "20px" }}>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          📊 Dashboard Overview
        </motion.h1>

        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
          <div className="card">🌾 Crops Listed</div>
          <div className="card">💰 Revenue</div>
          <div className="card">📦 Orders</div>
          <div className="card">📈 Growth</div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;