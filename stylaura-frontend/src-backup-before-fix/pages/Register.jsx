import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);

      navigate("/login");
    } catch (error) {
      setError(
        error.message || "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">

      <section className="auth-card">

        <div className="auth-brand">
          <Link to="/">STYLAURA</Link>
        </div>

        <div className="auth-heading">

          <p className="eyebrow">
            BEGIN YOUR JOURNEY
          </p>

          <h1>
            Create your
            <br />
            <span>profile.</span>
          </h1>

          <p>
            Create your STYLAURA account and begin
            discovering beauty designed around you.
          </p>

        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          <div className="auth-field">

            <label htmlFor="register-name">
              Full Name
            </label>

            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Enter your name"
              required
            />

          </div>

          <div className="auth-field">

            <label htmlFor="register-email">
              Email Address
            </label>

            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your email"
              required
            />

          </div>

          <div className="auth-field">

            <label htmlFor="register-password">
              Password
            </label>

            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Create a password"
              required
              minLength={6}
            />

          </div>

          <div className="auth-field">

            <label htmlFor="register-confirm-password">
              Confirm Password
            </label>

            <input
              id="register-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Confirm your password"
              required
              minLength={6}
            />

          </div>

          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        <div className="auth-footer">

          <p>
            Already have an account?
          </p>

          <Link to="/login">
            Sign in →
          </Link>

        </div>

      </section>

      <aside className="auth-art">

        <div className="auth-art-circle">

          <div className="auth-art-inner">
            <span>✦</span>
          </div>

        </div>

        <p>
          DISCOVER
          <br />
          WHAT MAKES
          <br />
          YOU UNIQUE.
        </p>

      </aside>

    </main>
  );
}

export default Register;