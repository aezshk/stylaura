import API_BASE_URL from ../api;

import { useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_URL = "${API_BASE_URL}/api/password-reset";

export default function ResetPassword() {
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/reset/${encodeURIComponent(token)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to reset password.");
      }

      setSuccess(true);
      setMessage(data.message);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "70vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
        background: "#faf7fa",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "36px",
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
        }}
      >
        <h1 style={{ color: "#8b5e83", marginTop: 0 }}>
          STYLAURA
        </h1>

        <h2>
          {success ? "Password updated" : "Create a new password"}
        </h2>

        {success ? (
          <>
            <p>{message}</p>
            <Link to="/login">Continue to login</Link>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <p>Choose a new password for your account.</p>

            <label htmlFor="password">New password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              style={inputStyle}
            />

            <label htmlFor="confirmPassword">
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
              style={inputStyle}
            />

            {error && (
              <p role="alert" style={{ color: "#b42318" }}>
                {error}
              </p>
            )}

            {message && <p>{message}</p>}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px",
                marginTop: "18px",
                border: "none",
                borderRadius: "24px",
                background: "#8b5e83",
                color: "#fff",
                cursor: loading ? "wait" : "pointer",
              }}
            >
              {loading ? "Updating..." : "Reset password"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: "12px",
  margin: "8px 0 18px",
  border: "1px solid #ddd",
  borderRadius: "8px",
};
