import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getUserProfile } from '../lib/api';

const styles = {
  navbar: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  container: {
    maxWidth: 1280,
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 20,
    fontWeight: 700,
    color: '#10b981',
    textDecoration: 'none',
  },
  logoIcon: {
    fontSize: 24,
  },
  nav: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  navLink: (isActive) => ({
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 500,
    color: isActive ? '#10b981' : '#4b5563',
    textDecoration: 'none',
    background: isActive ? '#ecfdf5' : 'transparent',
    transition: 'all 150ms ease',
  }),
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  userName: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: 500,
  },
  logoutButton: {
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    color: '#dc2626',
    background: '#fef2f2',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 150ms ease',
  },
};

export default function Navbar() {
  const { token, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUserName = async () => {
      if (!token) return;
      try {
        const { user } = await getUserProfile(token);
        setUserName(user.name || user.email.split('@')[0]);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      }
    };
    fetchUserName();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/home', label: 'Home', icon: '🏠' },
    { path: '/fridge', label: 'Fridge', icon: '🥗' },
    { path: '/recipes', label: 'Recipes', icon: '👨‍🍳' },
    { path: '/calender', label: 'Calendar', icon: '📅' },
  ];

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <Link to="/home" style={styles.logo}>
          <span style={styles.logoIcon}>🍽️</span>
          <span>YumYumApp</span>
        </Link>

        <div style={styles.nav}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={styles.navLink(location.pathname === link.path)}
              onMouseEnter={(e) => {
                if (location.pathname !== link.path) {
                  e.target.style.background = '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== link.path) {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              <span style={{ marginRight: 6 }}>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        <div style={styles.userSection}>
          {userName && <span style={styles.userName}>{userName}</span>}
          <button
            onClick={handleLogout}
            style={styles.logoutButton}
            onMouseEnter={(e) => {
              e.target.style.background = '#fee2e2';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#fef2f2';
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
