import React from 'react';
import { Link } from 'react-router-dom';
import './Nav.css';

export default function MobileDrawer({ open, items, onClose }) {
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
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
