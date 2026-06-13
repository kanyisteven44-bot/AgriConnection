import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/theme';
import '../pages/logo.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav>
      <div className="nav-logo">
        <Link to="/" className="logo-container" style={{ 
          marginLeft: 0, 
          fontWeight: '800', 
          color: colors.primaryGreen, 
          fontSize: '1.4rem', 
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div className="logo-icon-box" style={{ backgroundColor: colors.primaryGreen, color: 'white', padding: '4px', borderRadius: '6px', display: 'flex' }}>
            <span style={{ fontSize: '1.1rem' }} aria-hidden="true">🌾</span>
          </div>
          <span className="logo-text">AgriConnect</span>
        </Link>
      </div>
      <div className="nav-links" style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/marketplace">Marketplace</Link>
        
        {isAuthenticated ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <span style={{ marginLeft: '25px', color: colors.darkGray, fontSize: '0.9rem', fontWeight: '500' }}>
              Hi, {user?.name || 'User'}
            </span>
            <button 
              onClick={handleLogout} 
              style={{ 
                marginLeft: '25px',
                padding: '8px 18px',
                backgroundColor: 'transparent',
                color: colors.primaryGreen,
                border: `1px solid ${colors.primaryGreen}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.85rem',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = colors.primaryGreen;
                e.target.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = colors.primaryGreen;
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;