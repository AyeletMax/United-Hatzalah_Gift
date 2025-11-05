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
        <nav className="drawer-links" aria-label="תפריט ראשי">
          {/* Home button */}
          <Link
            to="/"
            className="drawer-link drawer-home-btn"
            onClick={onClose}
            aria-label="עמוד הבית"
          >
            <svg
              className="nav-home-icon"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M12 3.172l7 6.222V20a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4H11v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V9.394l7-6.222zm0-2.121L2.293 9.293a1 1 0 1 0 1.414 1.414L12 2.414l8.293 8.293a1 1 0 0 0 1.414-1.414L12 1.05z"/>
            </svg>
          </Link>

          {/* Category links */}
          {items
            .filter(i => i.path !== '/')
            .map(item => (
              <Link
                key={item.label}
                to={item.path}
                className="drawer-link"
                onClick={onClose}
              >
                <span>{item.label}</span>
                <span aria-hidden="true" className="nav-arrow">❯</span>
              </Link>
            ))}
        </nav>
      </aside>
    </>
  );
}
