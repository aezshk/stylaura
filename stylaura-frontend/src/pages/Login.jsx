import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";


function Login() {

  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (event) => {

    event.preventDefault();

    setError("");
    setLoading(true);

    try {

      await login(email, password);

      /*
        If the user came from a protected page,
        return them there.

        This also preserves analysis data
        such as the uploaded image, hair type,
        concern, etc.
      */

      const returnTo = location.state?.from;

      if (returnTo) {

        navigate(returnTo.pathname, {
          replace: true,
          state: returnTo.state,
        });

      } else {

        navigate("/dashboard");

      }

    } catch (error) {

      setError(
        error.message || "Unable to sign in."
      );

    } finally {

      setLoading(false);

    }
  };


  return (
    <main className="auth-page">

      <section className="auth-card">

        <div className="auth-brand">
          <Link to="/">
            STYLAURA
          </Link>
        </div>


        <div className="auth-heading">

          <p className="eyebrow">
            WELCOME BACK
          </p>

          <h1>
            Welcome
            <br />
            <span>back.</span>
          </h1>

          <p>
            Sign in to continue your personalized
            beauty journey.
          </p>

        </div>


        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          <div className="auth-field">

            <label htmlFor="login-email">
              Email Address
            </label>

            <input
              id="login-email"
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

            <label htmlFor="login-password">
              Password
            </label>

            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
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
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Signing In..."
              : "Sign In"}
          </button>

        </form>


        <div className="auth-footer">

          <p>
            Don't have an account?
          </p>

          <Link to="/register">
            Create an account →
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
          BEAUTY,
          <br />
          PERSONALIZED.
        </p>

      </aside>

    </main>
  );
}


export default Login;