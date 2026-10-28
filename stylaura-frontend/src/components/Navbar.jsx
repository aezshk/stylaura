
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

  const showBackButton = location.pathname !== "/";

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const getNavLinkClass = ({ isActive }) =>
    `navbar-link${isActive ? " active" : ""}`;

  const getActionLinkClass = ({ isActive }) =>
    `navbar-action-link${isActive ? " active" : ""}`;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
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
              aria-label="Go to previous page"
            >
              <span aria-hidden="true">←</span> Back
            </button>
          )}

          <Link
            to="/"
            className="navbar-logo"
            aria-label="STYLAURA home"
          >
            STYLAURA
          </Link>
        </div>

        <nav
          className="navbar-links"
          aria-label="Main navigation"
        >
          <NavLink
            to="/"
            end
            className={getNavLinkClass}
          >
            Home
          </NavLink>

          <NavLink
            to="/skin-analysis"
            className={getNavLinkClass}
          >
            Skin
          </NavLink>

          <NavLink
            to="/hair-analysis"
            className={getNavLinkClass}
          >
            Hair
          </NavLink>

          <NavLink
            to="/colour-analysis"
            className={getNavLinkClass}
          >
            Colour
          </NavLink>

          <NavLink
            to="/products"
            className={getNavLinkClass}
          >
            Products
          </NavLink>
        </nav>

        <div className="navbar-actions">
          {loading ? (
            <span
              className="navbar-loading"
              aria-live="polite"
            >
              Loading...
            </span>
          ) : user ? (
            <>
              <NavLink
                to="/dashboard"
                className={getActionLinkClass}
              >
                Profile
              </NavLink>

              <NavLink
                to="/orders"
                className={getActionLinkClass}
              >
                Orders
              </NavLink>

              <NavLink
                to="/cart"
                className={getActionLinkClass}
              >
                Cart
              </NavLink>

              <button
                type="button"
                className="navbar-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={getActionLinkClass}
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
