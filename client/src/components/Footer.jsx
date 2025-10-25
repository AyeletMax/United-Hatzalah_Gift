import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>Website built by Tzipora Himel & Ayelet Maximov</p>
        <div className="footer-emails">
          <a href="mailto:tzipora.himel@gmail.com">tzipora.himel@gmail.com</a>
          <span> | </span>
          <a href="mailto:ayelet2450@gmail.com">ayelet2450@gmail.com</a>
        </div>
      </div>
    </footer>
  );
}
