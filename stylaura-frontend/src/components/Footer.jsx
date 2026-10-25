import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="stylaura-footer">
      <div className="footer-container">

        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            STYLAURA
          </Link>

          <p>
            Your personalized beauty and styling journey,
            designed around you.
          </p>
        </div>

        <div className="footer-column">
          <h4>Explore</h4>

          <Link to="/">Home</Link>
          <Link to="/skin-analysis">Skin Analysis</Link>
          <Link to="/hair-analysis">Hair Analysis</Link>
          <Link to="/colour-analysis">Colour Analysis</Link>
          <Link to="/products">Products</Link>
        </div>

        <div className="footer-column">
          <h4>Account</h4>

          <Link to="/login">Sign In</Link>
          <Link to="/register">Create Account</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/cart">Cart</Link>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© 2026 STYLAURA. All rights reserved.</p>
        <span>Beauty, personalized.</span>
      </div>
    </footer>
  );
}

export default Footer;