import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { logout } from "../services/auth";

function Sidebar() {
  return (
    <motion.div
      className="sidebar"
      initial={{ x: -200 }}
      animate={{ x: 0 }}
    >
      <h2>🌾 AgriPanel</h2>

      <Link to="/dashboard">Dashboard</Link>
      <Link to="/marketplace">Marketplace</Link>

      <button onClick={logout} style={{ marginTop: "20px" }}>
        Logout
      </button>
    </motion.div>
  );
}

export default Sidebar;