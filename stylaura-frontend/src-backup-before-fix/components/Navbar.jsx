import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, loading, logout } = useAuth();

  const showBackButton =
    location.pathname !== "/";

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <header className="stylaura-navbar">
      <div className="navbar-container">

        <div className="navbar-left">
          {showBackButton && (
            <button
              type="button"
              className="navbar-back"
              onClick={handleBack}
            >
              ← Back
            </button>
          )}

          <Link
            to="/"
            className="navbar-logo"
          >
            STYLAURA
          </Link>
        </div>


        <nav className="navbar-links">
          <NavLink to="/" end>
            Home
          </NavLink>

          <NavLink to="/skin-analysis">
            Skin
          </NavLink>

          <NavLink to="/hair-analysis">
            Hair
          </NavLink>

          <NavLink to="/colour-analysis">
            Colour
          </NavLink>

          <NavLink to="/products">
            Products
          </NavLink>
        </nav>


        <div className="navbar-actions">

          {!loading && user ? (
            <>
              <Link
                to="/dashboard"
                className="navbar-action-link"
              >
                Profile
              </Link>

              <Link
                to="/orders"
                className="navbar-action-link"
              >
                Orders
              </Link>

              <Link
                to="/cart"
                className="navbar-action-link"
              >
                Cart
              </Link>

              <button
                type="button"
                className="navbar-logout"
                onClick={async () => {
                  await logout();
                  navigate("/");
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="navbar-action-link"
              >
                Sign In
              </NavLink>

              <Link
                to="/register"
                className="navbar-create"
              >
                Create Account
              </Link>
            </>
          )}

        </div>

      </div>
    </header>
  );
}

export default Navbar;