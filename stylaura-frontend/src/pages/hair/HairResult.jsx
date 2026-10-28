
import API_BASE_URL from "../../api";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

function HairResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const hairType = location.state?.hairType;
  const concern = location.state?.concern;
  const image = location.state?.image;

  const [status, setStatus] = useState("analyzing");
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle");

  useEffect(() => {
    if (!image || !hairType || !concern) {
      navigate("/hair-analysis", { replace: true });
      return;
    }

    let cancelled = false;

    async function analyzeHair() {
      setStatus("analyzing");
      setError("");
      setAnalysis(null);
      setSaveStatus("idle");

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/analysis/hair`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              image,
              hairType,
              concern,
            }),
          }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to analyze this photo."
          );
        }

        if (
  !data.success ||
  !data.analysis ||
  data.analysis.validImage !== true ||
  typeof data.analysis.summary !== "string" ||
  !Array.isArray(data.analysis.observations) ||
  !Array.isArray(data.analysis.recommendations)
) {
  throw new Error(
    "This photo could not be verified for hair analysis. Please upload a clear photo showing hair or scalp."
  );
}

        if (data.analysis.validImage !== true) {
          throw new Error(
            "This photo could not be verified as suitable for hair analysis. Please upload a clear photo showing your hair or scalp."
          );
        }

        if (cancelled) return;

        setAnalysis(data.analysis);
        setStatus("success");
      } catch (err) {
        if (cancelled) return;

        console.error("Hair analysis error:", err);
        setError(
          err.message ||
            "Something went wrong. Please try another photo."
        );
        setStatus("error");
      }
    }

    analyzeHair();

    return () => {
      cancelled = true;
    };
  }, [image, hairType, concern, navigate]);

  const handleSaveProfile = async () => {
    if (!analysis || saveStatus === "saving") return;

    setSaveStatus("saving");
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/hair-profile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            image,
            hairType,
            concern,
            analysis,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save your hair profile. Please sign in again."
        );
      }

      setSaveStatus("saved");

      if (typeof checkAuth === "function") {
        await checkAuth();
      }
    } catch (err) {
      console.error("Hair profile save error:", err);
      setError(err.message || "Unable to save your profile.");
      setSaveStatus("error");
    }
  };

  if (status === "analyzing") {
    return (
      <main className="result-page hair-result-page">
        <section className="result-intro">
          <p className="eyebrow">STYLAURA · HAIR ANALYSIS</p>
          <h1>
            Understanding your
            <br />
            <em>hair needs.</em>
          </h1>
          <p>
            We're checking your photo before preparing your
            personalized results.
          </p>
          <p role="status" aria-live="polite">
            Analysis in progress…
          </p>
        </section>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="result-page hair-result-page">
        <section className="result-intro">
          <p className="eyebrow">STYLAURA · HAIR ANALYSIS</p>
          <h1>
            Let's try
            <br />
            <em>another photo.</em>
          </h1>
          <p className="auth-error" role="alert">
            {error}
          </p>
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate("/hair-analysis")}
          >
            Try Again
          </button>
        </section>
      </main>
    );
  }

  const observations = Array.isArray(analysis.observations)
    ? analysis.observations
    : [];

  const recommendations = Array.isArray(analysis.recommendations)
    ? analysis.recommendations
    : [];

  return (
    <main className="result-page hair-result-page">
      <section className="result-intro">
        <p className="eyebrow">STYLAURA · YOUR HAIR PROFILE</p>

        <h1>
          Your hair,
          <br />
          <em>understood.</em>
        </h1>

        <p>
          Here are the observations available from your submitted photo
          and the preferences you selected. Image-based observations
          are estimates, not a medical diagnosis.
        </p>

        {saveStatus === "saved" && (
          <p className="profile-save-status" role="status">
            Your profile has been saved.
          </p>
        )}

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
      </section>

      <section className="result-content">
        <div className="result-main-card hair-result-main">
          <div className="result-card-header">
            <div>
              <p className="result-label">HAIR PROFILE</p>
              <h2>{hairType}</h2>
            </div>

            <span className="result-score">
              PHOTO REVIEW COMPLETE
            </span>
          </div>

          <div className="hair-result-photo">
            <img src={image} alt="Photo submitted for hair analysis" />
          </div>

          <div className="result-stats">
            <div>
              <span>Your Hair Type</span>
              <strong>{hairType}</strong>
            </div>

            <div>
              <span>Your Main Concern</span>
              <strong>{concern}</strong>
            </div>

            <div>
              <span>Image Review</span>
              <strong>Completed</strong>
            </div>
          </div>

          <section className="hair-observations">
            <h3>Photo observations</h3>

            {observations.length > 0 ? (
              <ul>
                {observations.map((item, index) => (
                  <li key={`${index}-${item}`}>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                No additional visual observations were returned.
              </p>
            )}
          </section>

          {analysis.summary && (
            <section className="hair-observations">
              <h3>Your analysis summary</h3>
              <p>{analysis.summary}</p>
            </section>
          )}
        </div>

        <aside className="result-side-card hair-result-side">
          <p className="side-label">YOUR NEXT STEPS</p>

          <h3>
            Care for your hair
            <br />
            with a
            <br />
            <em>consistent routine.</em>
          </h3>

          <p>
            Recommendations are intended for general cosmetic care.
            A photo alone cannot reliably diagnose scalp conditions
            or determine the cause of hair loss.
          </p>

         <div className="focus-list">
  {recommendations.length > 0 ? (
    recommendations.map((item, index) => (
      <div key={`${index}-${item}`}>
        <span>{String(index + 1).padStart(2, "0")}</span>
        <strong>{item}</strong>
      </div>
    ))
  ) : (
    <p>No AI recommendations were returned for this photo.</p>
  )}
</div>

          <button
            type="button"
            className="primary-button"
            onClick={handleSaveProfile}
            disabled={
              saveStatus === "saving" || saveStatus === "saved"
            }
          >
            {saveStatus === "saving"
              ? "Saving…"
              : saveStatus === "saved"
                ? "Profile Saved"
                : "Save My Hair Profile"}
          </button>
        </aside>
      </section>

      <section className="result-cta hair-result-cta">
        <p className="eyebrow">NEXT STEP</p>

        <h2>
          Find your
          <br />
          <em>hair routine.</em>
        </h2>

        <p>
          Explore products that match your selected hair type and concern.
        </p>

        <Link
          to="/products?view=recommended&focus=hair"
          className="primary-button"
        >
          Explore My Recommendations →
        </Link>
      </section>
    </main>
  );
}

export default HairResult;
