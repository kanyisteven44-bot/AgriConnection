import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { colors } from '../constants/theme'; // Import colors from theme file
import './Home.css'; // Import a dedicated CSS file for Home page styles

const Home = () => {
  const features = [
    { title: 'Smart Marketplace', desc: 'Directly connect with local and global buyers in a transparent environment.', icon: '🛒' },
    { title: 'AI Crop Prediction', desc: 'Leverage machine learning to predict yields and optimize planting schedules.', icon: '🤖' },
    { title: 'Market Price Intelligence', desc: 'Stay updated with real-time market trends and fair pricing data.', icon: '📊' },
    { title: 'Secure Payments', desc: 'Fintech-level security for all transactions and digital escrow services.', icon: '🛡️' },
    { title: 'Logistics Management', desc: 'Streamlined transport and supply chain solutions for your produce.', icon: '🚚' },
    { title: 'Farmer Financing', desc: 'Tailored financial products and credit facilities for small-scale farmers.', icon: '🏦' },
  ];

  const stats = [
    { label: 'Registered Farmers', value: '10,000+' },
    { label: 'Active Buyers', value: '5,000+' },
    { label: 'Transactions', value: '$2M+' },
    { label: 'Crops Listed', value: '50,000+' },
  ];

  const testimonials = [
    { name: 'Samuel Mwangi', role: 'Maize Farmer', text: "AgriConnection gave me access to buyers I never thought I'd reach. My revenue has increased by 40%." },
    { name: 'Sarah Jenkins', role: 'Bulk Buyer', text: "The quality assurance and logistics tracking make sourcing produce incredibly reliable." }
  ];

  return (
    <div className="home-container">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section" style={{
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url("https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=2000")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="hero-title">
            Connecting Farmers, Buyers <br /> and Opportunities
          </h1>
          <p className="hero-description">
            AgriConnection empowers farmers with market access, AI-powered insights, financing opportunities and direct buyer connections.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="button-link">
              <button className="primary-button">Get Started</button>
            </Link>
            <Link to="/marketplace" className="button-link">
              <button className="secondary-button">Explore Marketplace</button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="section-title">Core Features</h2>
          <div className="features-grid">
            {features.map((f, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="feature-card"
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '20px' }}>{f.icon}</div>
                <h3 style={{ color: colors.secondaryGreen, marginBottom: '15px' }}>{f.title}</h3>
                <p style={{ color: '#666', lineHeight: '1.5' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-section">
        <div className="stats-container">
          {stats.map((s, idx) => (
            <div key={idx} className="stat-item">
              <h2 style={{ fontSize: '2.5rem', color: colors.accentGold, marginBottom: '5px' }}>{s.value}</h2>
              <p style={{ fontSize: '1rem', opacity: '0.9' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="testimonials-container">
          <h2 className="section-title">What Our Users Say</h2>
          <div className="testimonials-grid">
            {testimonials.map((t, idx) => (
              <div key={idx} className="testimonial-card">
                <p style={{ fontStyle: 'italic', marginBottom: '20px', color: '#555' }}>"{t.text}"</p>
                <h4 style={{ color: colors.primaryGreen, marginBottom: '2px' }}>{t.name}</h4>
                <small style={{ color: '#888' }}>{t.role}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section (Placeholders) */}
      <section className="partners-section">
        <p className="partners-intro">Trusted by Industry Leaders</p>
        <div className="partners-list">
          <span className="partner-logo">AgriBank</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>GlobalLogistics</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>EcoFarm</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>TechSeed</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-section">
        <div className="footer-content">
          <div className="footer-brand">
            <h3 style={{ 
              color: colors.accentGold, 
              marginBottom: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px' 
            }}>
              <span style={{ backgroundColor: colors.accentGold, color: colors.primaryGreen, padding: '4px', borderRadius: '4px' }}>🌾</span>
              AgriConnection
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#bbb', lineHeight: '1.6' }}>
              The comprehensive digital ecosystem for modern agriculture. Empowering the backbone of our economy through technology.
            </p>
          </div>
          <div>
            <h4 style={{ marginBottom: '20px' }}>Platform</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', color: '#bbb' }}>
              <li style={{ marginBottom: '10px' }}>Marketplace</li>
              <li style={{ marginBottom: '10px' }}>AI Insights</li>
              <li style={{ marginBottom: '10px' }}>Financing</li>
              <li style={{ marginBottom: '10px' }}>Logistics</li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '20px' }}>Roles</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', color: '#bbb' }}>
              <li style={{ marginBottom: '10px' }}>For Farmers</li>
              <li style={{ marginBottom: '10px' }}>For Buyers</li>
              <li style={{ marginBottom: '10px' }}>For Experts</li>
              <li style={{ marginBottom: '10px' }}>For Transporters</li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '20px' }}>Contact</h4>
            <p style={{ fontSize: '0.9rem', color: '#bbb' }}>
              info@agriconnection.com<br />
              +254 700 000 000<br />
              Nairobi, Kenya
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} AgriConnection Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;