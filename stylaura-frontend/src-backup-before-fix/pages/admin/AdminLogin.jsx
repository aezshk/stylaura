import API_BASE_URL from "../../api;
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login, user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("admin@stylaura.com");
  const [password, setPassword] = useState(
    "ChangeThisAdminPassword123!"
  );

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const loggedInUser = await login(email, password);

      if (loggedInUser.role !== "admin") {
        await fetch(
          "${API_BASE_URL}/api/auth/logout",
          {
            method: "POST",
            credentials: "include",
          }
        );

        throw new Error(
          "This account does not have administrator access."
        );
      }

      const from = location.state?.from || "/admin";

      navigate(from, {
        replace: true,
      });

    } catch (error) {
      setError(
        error.message ||
          "Unable to sign in as administrator."
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <main className="admin-login-page">
        <section className="admin-login-card">
          <p className="eyebrow">STYLAURA ADMIN</p>
          <h1>
            Checking
            <br />
            <em>access.</em>
          </h1>
        </section>
      </main>
    );
  }

  if (user?.role === "admin") {
    navigate("/admin", {
      replace: true,
    });

    return null;
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">

        <div className="admin-login-brand">
          STYLAURA
        </div>

        <p className="eyebrow">
          ADMINISTRATION
        </p>

        <h1>
          Welcome to
          <br />
          <em>STYLAURA Admin.</em>
        </h1>

        <p className="admin-login-description">
          Sign in with your administrator account
          to manage the STYLAURA platform.
        </p>

        <form
          className="admin-login-form"
          onSubmit={handleSubmit}
        >

          <div className="auth-field">
            <label htmlFor="admin-email">
              Admin Email
            </label>

            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter admin email"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="admin-password">
              Password
            </label>

            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter admin password"
              required
            />
          </div>

          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="admin-login-submit"
            disabled={loading}
          >
            {loading
              ? "Signing In..."
              : "Admin Sign In"}
          </button>

        </form>

      </section>
    </main>
  );
}

export default AdminLogin;