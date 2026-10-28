
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
    if (!hairType || !concern) {
      navigate("/hair-analysis", { replace: true });
      return;
    }

    let cancelled = false;

    async function loadCareGuide() {
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
              hairType,
              concern,
            }),
          }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to prepare your hair-care guide."
          );
        }

        if (
          !data.success ||
          !data.analysis ||
          typeof data.analysis.summary !== "string" ||
          !Array.isArray(data.analysis.observations) ||
          !Array.isArray(data.analysis.recommendations)
        ) {
          throw new Error(
            "We couldn't prepare your care guide. Please try again."
          );
        }

        if (cancelled) return;

        setAnalysis({
          ...data.analysis,
          mode: "rule_based",
          photoAnalyzed: false,
        });

        setStatus("success");
      } catch (err) {
        if (cancelled) return;

        console.error("Hair-care guide error:", err);
        setError(
          err.message || "Something went wrong. Please try again."
        );
        setStatus("error");
      }
    }

    loadCareGuide();

    return () => {
      cancelled = true;
    };
  }, [hairType, concern, navigate]);

  const handleSaveProfile = async () => {
    if (!analysis || saveStatus === "saving" || saveStatus === "saved") {
      return;
    }

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
            image: image || null,
            hairType,
            concern,
            analysis: {
              ...analysis,
              mode: "rule_based",
              photoAnalyzed: false,
            },
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
          <p className="eyebrow">STYLAURA · HAIR CARE</p>
          <h1>
            Preparing your
            <br />
            <em>care guide.</em>
          </h1>
          <p>
            We're preparing suggestions based on your selected hair type
            and concern.
          </p>
          <p role="status" aria-live="polite">
            Preparing your guide…
          </p>
        </section>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="result-page hair-result-page">
        <section className="result-intro">
          <p className="eyebrow">STYLAURA · HAIR CARE</p>
          <h1>
            Let's try
            <br />
            <em>again.</em>
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

  const observations = analysis?.observations || [];
  const recommendations = analysis?.recommendations || [];

  return (
    <main className="result-page hair-result-page">
      <section className="result-intro">
        <p className="eyebrow">STYLAURA · YOUR HAIR CARE GUIDE</p>

        <h1>
          Care for your hair,
          <br />
          <em>your way.</em>
        </h1>

        

        <p className="profile-save-status" role="note">
        </p>

        {saveStatus === "saved" && (
          <p className="profile-save-status" role="status">
            Your hair profile has been saved.
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
              <p className="result-label">YOUR SELECTED PROFILE</p>
              <h2>{hairType}</h2>
            </div>
            <span className="result-score">FREE CARE GUIDE</span>
          </div>

          {image && (
            <div className="hair-result-photo">
              <img
                src={image}
                alt="Photo you selected for your hair-care session; not analyzed"
              />
              <p>
                This is your selected photo. It was not analyzed.
              </p>
            </div>
          )}

          <div className="result-stats">
            <div>
              <span>Selected Hair Type</span>
              <strong>{hairType}</strong>
            </div>

            <div>
              <span>Main Concern</span>
              <strong>{concern}</strong>
            </div>

            <div>
              <span>Guide Type</span>
              <strong>General care</strong>
            </div>
          </div>

          <section className="hair-observations">
            <h3>About your care guide</h3>
            <p>{analysis.summary}</p>
          </section>

          <section className="hair-observations">
            <h3>Things to keep in mind</h3>
            {observations.length > 0 ? (
              <ul>
                {observations.map((item, index) => (
                  <li key={`${index}-${item}`}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>
                This guide uses your selected preferences, not photo
                observations.
              </p>
            )}
          </section>
        </div>

        <aside className="result-side-card hair-result-side">
          <p className="side-label">YOUR NEXT STEPS</p>

          <h3>
            Build a
            <br />
            <em>simple routine.</em>
          </h3>

          <p>
            These are general cosmetic-care suggestions, not a diagnosis
            or a photo-based assessment.
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
              <p>No care suggestions are available for this selection.</p>
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
                : saveStatus === "error"
                  ? "Try Saving Again"
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
          Explore products that may suit your selected hair type and concern.
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
