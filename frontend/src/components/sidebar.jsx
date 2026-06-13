import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/theme';
import '../pages/logo.css';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Marketplace', path: '/marketplace', icon: '🌾' },
    { name: 'Inbox', path: '/inbox', icon: '✉️' },
    { name: 'Profile', path: '/profile', icon: '👤' },
    { name: 'User Settings', path: '/profile', icon: '⚙️' },
  ];

  return (
    <div className="sidebar" style={{ 
      width: '240px', 
      height: '100vh', 
      backgroundColor: colors.white, 
      borderRight: '1px solid #eee', 
      position: 'fixed', 
      left: 0, 
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px'
    }}>
      <div className="sidebar-brand logo-container" style={{ 
        marginBottom: '40px', 
        fontWeight: '800', 
        color: colors.primaryGreen, 
        fontSize: '1.4rem',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div className="logo-icon-box" style={{ backgroundColor: colors.primaryGreen, color: 'white', padding: '5px', borderRadius: '8px', display: 'flex' }}>
          <span style={{ fontSize: '1.2rem' }} aria-hidden="true">🌾</span>
        </div>
        <span className="logo-text">AgriConnect</span>
      </div>

      <div className="sidebar-menu" style={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 15px',
              textDecoration: 'none',
              color: location.pathname === item.path ? colors.primaryGreen : colors.darkGray,
              backgroundColor: location.pathname === item.path ? '#e6f4ea' : 'transparent',
              borderRadius: '8px',
              marginBottom: '10px',
              fontWeight: '500'
            }}
          >
            <span style={{ marginRight: '10px' }}>{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </div>

      <button 
        onClick={handleLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 15px',
          width: '100%',
          border: 'none',
          backgroundColor: 'transparent',
          color: '#d32f2f',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: '600',
          textAlign: 'left'
        }}
      >
        <span style={{ marginRight: '10px' }}>🚪</span>
        Logout
      </button>
    </div>
  );
};

export default Sidebar;