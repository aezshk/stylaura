
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AuthGate({ title, description }) {
  const location = useLocation();
  const { loading } = useAuth();

  const returnLocation = {
    pathname: location.pathname,
    search: location.search,
    state: location.state,
  };

  if (loading) {
    return (
      <main className="auth-gate-page">
        <section
          className="auth-gate-card"
          aria-live="polite"
          aria-busy="true"
        >
          <p className="eyebrow">STYLAURA</p>

          <h1>
            Checking your
            <br />
            <em>profile.</em>
          </h1>

          <p>
            Please wait while we check your personalized
            STYLAURA account.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-gate-page">
      <section className="auth-gate-card">
        <p className="eyebrow">
          STYLAURA • ACCOUNT REQUIRED
        </p>

        <h1>
          {title || (
            <>
              Your personalized
              <br />
              <em>journey awaits.</em>
            </>
          )}
        </h1>

        <p>
          {description ||
            "Sign in or create a STYLAURA account to continue. Your personalized information will be saved to your profile."}
        </p>

        <div className="auth-gate-actions">
          <Link
            to="/login"
            state={{ from: returnLocation }}
            className="primary-button"
          >
            Sign In
          </Link>

          <Link
            to="/register"
            state={{ from: returnLocation }}
            className="secondary-button"
          >
            Create Account
          </Link>
        </div>

        <p className="auth-gate-note">
          Already have an account? Sign in to continue
          where you left off.
        </p>
      </section>
    </main>
  );
}

export default AuthGate;
