export default function Hero() {
  return (
    <header style={{
      background: 'linear-gradient(135deg, var(--uh-navy), #0f1a24)',
      color: 'var(--white)'
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: 24,
        alignItems: 'center',
        padding: '64px 0'
      }}>
        <div>
          <h1 style={{ fontSize: 40, margin: 0, lineHeight: 1.1 }}>מתנה שמצילה את היום</h1>
          <p style={{ opacity: .9, marginTop: 12, fontSize: 18 }}>קו נקי, צבעים של איחוד הצלה, ומתנות שמדברות בעד עצמן.</p>
          <div style={{ marginTop: 20 }}>
            <a className="btn-primary" href="#categories">גללו לקטגוריות</a>
          </div>
        </div>
        <div style={{
          justifySelf: 'center',
          width: '100%',
          maxWidth: 420,
          aspectRatio: '1 / 1',
          background: 'conic-gradient(from 40deg, var(--uh-orange), #ff9b5f, var(--uh-orange))',
          borderRadius: 24,
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0,0,0,.3)'
        }}>
          <div style={{
            position: 'absolute', inset: 12, borderRadius: 20,
            background: 'radial-gradient(80% 80% at 30% 30%, rgba(255,255,255,.22), transparent)',
            border: '1px solid rgba(255,255,255,.25)'
          }} />
        </div>
      </div>
    </header>
  );
}


