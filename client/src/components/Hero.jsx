import React from 'react'
import logo from '../assets/לוגו_איחוד_חדש_002.png';
import './Hero.css';

export default function Hero() {
  return (
    <header style={{
      background: 'linear-gradient(135deg, var(--uh-navy), #0f1a24)',
      color: 'var(--white)'
    }}>
      <div className="container hero-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: 24,
        alignItems: 'center',
        padding: '64px 0'
      }}>
        <div>
          <h1 className="hero-title" style={{ fontSize: 40, margin: 0, lineHeight: 1.1 }}>מתנה שמצילה את היום</h1>
          <div style={{ marginTop: 20 }}>
            <a className="btn-primary" href="#categories">גללו לקטגוריות</a>
          </div>
        </div>
        <div style={{
          justifySelf: 'center',
          width: '100%',
          maxWidth: 420,
          aspectRatio: '1 / 1',
          background: 'conic-gradient(from 40deg,rgb(241, 175, 120),rgb(253, 205, 156),rgb(240, 172, 116))',
          borderRadius: 24,
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0,0,0,.3)'
        }}>
          <img src={logo} alt="לוגו איחוד הצלה" style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60%',
            height: '60%',
            objectFit: 'contain',
            zIndex: 2,
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', inset: 12, borderRadius: 20,
            background: 'radial-gradient(80% 80% at 30% 30%, rgba(255,255,255,.22), transparent)',
            border: '1px solid rgba(255,255,255,.25)',
            zIndex: 3
          }} />
        </div>
      </div>
    </header>
  );
}


