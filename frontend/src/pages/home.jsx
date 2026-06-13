import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

const Home = () => {
  // Theme Colors
  const colors = {
    primaryGreen: '#1B5E20',
    secondaryGreen: '#2E7D32',
    accentGold: '#FFC107',
    white: '#FFFFFF',
    lightGray: '#F5F5F5'
  };

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
    <div style={{ backgroundColor: colors.white, fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{ 
        padding: '120px 20px 80px', 
        background: `linear-gradient(rgba(27, 94, 32, 0.05), rgba(255, 255, 255, 1))`,
        textAlign: 'center' 
      }}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 style={{ color: colors.primaryGreen, fontSize: '3rem', fontWeight: '800', marginBottom: '20px' }}>
            Connecting Farmers, Buyers <br /> and Opportunities
          </h1>
          <p style={{ color: '#444', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto 40px', lineHeight: '1.6' }}>
            AgriConnection empowers farmers with market access, AI-powered insights, financing opportunities and direct buyer connections.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <button style={{ 
                backgroundColor: colors.primaryGreen, 
                color: 'white', 
                padding: '15px 35px', 
                borderRadius: '8px', 
                border: 'none', 
                fontSize: '1rem', 
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(27, 94, 32, 0.3)'
              }}>Get Started</button>
            </Link>
            <Link to="/marketplace" style={{ textDecoration: 'none' }}>
              <button style={{ 
                backgroundColor: colors.white, 
                color: colors.primaryGreen, 
                padding: '15px 35px', 
                borderRadius: '8px', 
                border: `2px solid ${colors.primaryGreen}`, 
                fontSize: '1rem', 
                fontWeight: '600',
                cursor: 'pointer'
              }}>Explore Marketplace</button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 20px', backgroundColor: colors.white }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', color: colors.primaryGreen, marginBottom: '50px', fontSize: '2.2rem' }}>Core Features</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            {features.map((f, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                style={{ 
                  padding: '40px', 
                  borderRadius: '12px', 
                  backgroundColor: 'white', 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                  border: '1px solid #eee'
                }}
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
      <section style={{ padding: '60px 20px', backgroundColor: colors.primaryGreen, color: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '40px' }}>
          {stats.map((s, idx) => (
            <div key={idx} style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '2.5rem', color: colors.accentGold, marginBottom: '5px' }}>{s.value}</h2>
              <p style={{ fontSize: '1rem', opacity: '0.9' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '80px 20px', backgroundColor: colors.lightGray }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', color: colors.primaryGreen, marginBottom: '50px' }}>What Our Users Say</h2>
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {testimonials.map((t, idx) => (
              <div key={idx} style={{ 
                backgroundColor: 'white', 
                padding: '30px', 
                borderRadius: '12px', 
                flex: '1', 
                minWidth: '300px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.03)'
              }}>
                <p style={{ fontStyle: 'italic', marginBottom: '20px', color: '#555' }}>"{t.text}"</p>
                <h4 style={{ color: colors.primaryGreen, marginBottom: '2px' }}>{t.name}</h4>
                <small style={{ color: '#888' }}>{t.role}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section (Placeholders) */}
      <section style={{ padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ color: '#999', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '30px', fontSize: '0.8rem' }}>Trusted by Industry Leaders</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '50px', opacity: 0.5, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>AgriBank</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>GlobalLogistics</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>EcoFarm</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>TechSeed</span>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#111', color: 'white', padding: '80px 20px 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
          <div>
            <h3 style={{ color: colors.accentGold, marginBottom: '20px' }}>🌾 AgriConnection</h3>
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
        <div style={{ 
          maxWidth: '1200px', 
          margin: '60px auto 0', 
          paddingTop: '20px', 
          borderTop: '1px solid #333', 
          textAlign: 'center',
          fontSize: '0.8rem',
          color: '#666'
        }}>
          © {new Date().getFullYear()} AgriConnection Platform. All rights reserved.
        </div>
      </footer>

      {/* Inline Global Styles for Cards/Containers */}
      <style dangerouslySetInnerHTML={{ __html: `
        .card {
          transition: all 0.3s ease;
        }
        input:focus {
          outline: none;
          border-color: ${colors.primaryGreen};
        }
        nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 5%;
          background: white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          position: fixed;
          top: 0;
          width: 90%;
          z-index: 1000;
        }
        nav a {
          text-decoration: none;
          color: #333;
          margin-left: 25px;
          font-weight: 500;
          font-size: 0.9rem;
        }
        nav a:hover {
          color: ${colors.primaryGreen};
        }
      `}} />
    </div>
  );
};

export default Home;