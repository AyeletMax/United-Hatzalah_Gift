import React from 'react';
import { Link } from 'react-router-dom';
import './Nav.css';

export default function MobileDrawer({ open, items, onClose }) {
  if (!open) return null;
  return (
    <>
      <div className="drawer-overlay" onClick={onClose}></div>
      <aside className="mobile-drawer">
        <button className="drawer-close" onClick={onClose}>×</button>
        <nav className="drawer-links">
          {items.map(item => (
            <Link key={item.label} to={item.path} className="drawer-link" onClick={onClose}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
