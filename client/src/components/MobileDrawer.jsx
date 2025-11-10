import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Nav.css';

export default function MobileDrawer({ open, items, onClose }) {
  const location = useLocation();
  
  const handleLinkClick = () => {
    if (navigator.vibrate) navigator.vibrate(50);
    setTimeout(onClose, 200);
  };

  const handleCloseClick = () => {
    if (navigator.vibrate) navigator.vibrate(30);
    onClose();
  };

  if (!open) return null;
  return (
    <>
      <div className="drawer-overlay" onClick={onClose}></div>
      <aside className="mobile-drawer">
        <button className="drawer-close" onClick={handleCloseClick}>×</button>
        <nav className="drawer-links">
          {items.map(item => (
            <Link key={item.label} to={item.path} className="drawer-link" onClick={handleLinkClick}>
              {item.path === '/' ? (
                <svg
                  className="nav-home-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 3.172l7 6.222V20a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4H11v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V9.394l7-6.222zm0-2.121L2.293 9.293a1 1 0 1 0 1.414 1.414L12 2.414l8.293 8.293a1 1 0 0 0 1.414-1.414L12 1.05z"/>
                </svg>
              ) : (
                item.label
              )}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}

