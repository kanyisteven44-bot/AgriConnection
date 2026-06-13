import Sidebar from "../components/sidebar";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { colors } from '../constants/theme';
import './Dashboard.css'; // Import a dedicated CSS file for Dashboard styles

function Dashboard() {
  const { user } = useAuth();
  const userName = user?.name || "Samuel";

  return (
    <div className="dashboard-page" style={{
      backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92)), url("https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=2000")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      minHeight: '100vh'
    }}>
      <Sidebar />

      <div className="dashboard-content">
        <div className="dashboard-header">
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            👋 Hello, {userName}
          </motion.h1>
          <p className="welcome-text">Welcome back to AgriConnect. Here is your market overview.</p>
        </div>

        <div className="intelligence-grid">
          {/* Market Intelligence Panel */}
          <div className="intel-card price-update">
            <h3>📈 Daily Maize Price</h3>
            <p className="price-val">KES 3,200</p>
            <small>per 90kg bag • Nairobi</small>
            <div className="trend-indicator up">▲ 2.4% since yesterday</div>
          </div>

          {/* Weather Panel */}
          <div className="intel-card weather-panel">
            <h3>🌤 Weather Advisory</h3>
            <p className="temp-val">24°C</p>
            <p className="condition">Sunny • Good for drying grain</p>
            <small>Nairobi, Kenya</small>
          </div>
        </div>

        <h2 className="section-heading">⚡ Quick Actions</h2>
        <div className="quick-actions-grid">
          <button className="action-btn">View Buyers</button>
          <button className="action-btn">Sell Produce</button>
          <button className="action-btn">Market Prices</button>
          <button className="action-btn">Advisory</button>
        </div>

        <h2 className="section-heading">📊 Performance Summary</h2>
        <div className="dashboard-cards-grid">
          <div className="card">
            <span className="card-label">Active Offers</span>
            <span className="card-value">12</span>
          </div>
          <div className="card">
            <span className="card-label">Total Revenue</span>
            <span className="card-value">KES 45.2K</span>
          </div>
          <div className="card">
            <span className="card-label">Orders</span>
            <span className="card-value">5 Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;