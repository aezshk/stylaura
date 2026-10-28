
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../api";

const ANALYSIS_ENDPOINT = `${API_BASE_URL}/api/analysis/skin`;
const SAVE_ENDPOINT = `${API_BASE_URL}/api/auth/skin-profile`;

function SkinResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const image = location.state?.image;

  const [status, setStatus] = useState("analyzing");
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle");

  // Prevent duplicate analysis requests during React effect re-runs.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;

    if (!image || typeof image !== "string" ||
        !image.startsWith("data:image/")) {
      setStatus("error");
      setError("No valid photo was provided. Please upload a photo first.");
      return;
    }

    startedRef.current = true;
    const controller = new AbortController();

    async function analyzeSkin() {
      setStatus("analyzing");
      setError("");

      try {
        const response = await fetch(ANALYSIS_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
          body: JSON.stringify({ image }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message ||
            (response.status === 401
              ? "Please sign in to analyze your skin."
              : "Unable to analyze this photo.")
          );
        }

        if (
          !data?.success ||
          !data?.analysis ||
          typeof data.analysis.skinType !== "string"
        ) {
          throw new Error(
            data?.message ||
            "The analysis service returned an invalid result."
          );
        }

        setAnalysis(data.analysis);
        setStatus("complete");
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error("Skin analysis error:", err);
        setError(err.message || "Skin analysis failed. Please try again.");
        setStatus("error");
      }
    }

    analyzeSkin();

    return () => controller.abort();
  }, [image]);

  const saveProfile = async () => {
    if (!analysis || saveStatus === "saving" || saveStatus === "saved") {
      return;
    }

    setSaveStatus("saving");
    setError("");

    try {
      const response = await fetch(SAVE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          image,
          ...analysis,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Unable to save your profile.");
      }

      setSaveStatus("saved");
    } catch (err) {
      console.error("Skin profile save error:", err);
      setSaveStatus("error");
      setError(err.message || "Unable to save your profile.");
    }
  };

  if (status === "analyzing") {
    return (
      <main className="result-page skin-result-page">
        <section className="result-intro" aria-live="polite">
          <p className="eyebrow">STYLAURA · SKIN ANALYSIS</p>
          <h1>
            Understanding your
            <br />
            <em>skin profile.</em>
          </h1>
          <p>
            Checking your photo and preparing your analysis.
            Please keep this page open.
          </p>
          <div className="analysis-loading" role="status">
            Analyzing your photo…
          </div>
        </section>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="result-page skin-result-page">
        <section className="result-intro">
          <p className="eyebrow">STYLAURA · SKIN ANALYSIS</p>
          <h1>
            Let's get a
            <br />
            <em>clearer picture.</em>
          </h1>
          <p className="auth-error" role="alert">{error}</p>
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate("/skin-analysis")}
          >
            Upload Another Photo
          </button>
        </section>
      </main>
    );
  }

  const fields = [
    ["Hydration", analysis.hydration],
    ["Texture", analysis.texture],
    ["Sensitivity", analysis.sensitivity],
  ];

  return (
    <main className="result-page skin-result-page">
      <section className="result-intro">
        <p className="eyebrow">STYLAURA · YOUR SKIN PROFILE</p>

        <h1>
          Your skin,
          <br />
          <em>understood.</em>
        </h1>

        <p>
          These are image-based observations, not a medical diagnosis.
          Lighting, camera quality, and image angle can affect accuracy.
        </p>

        {saveStatus === "saved" && (
          <p className="profile-save-status" role="status">
            Your profile has been saved.
          </p>
        )}

        {saveStatus === "error" && (
          <p className="auth-error" role="alert">{error}</p>
        )}
      </section>

      <section className="result-content">
        <article className="result-main-card">
          <header className="result-card-header">
            <div>
              <p className="result-label">SKIN PROFILE</p>
              <h2>{analysis.skinType}</h2>
            </div>
            <span className="result-score">IMAGE OBSERVATIONS</span>
          </header>

          <div className="skin-result-image">
            <img src={image} alt="Photo used for skin analysis" />
          </div>

          <div className="result-stats">
            {fields.map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value || "Not assessed"}</strong>
              </div>
            ))}
          </div>

          {analysis.summary && (
            <p className="result-summary">{analysis.summary}</p>
          )}
        </article>

        <aside className="result-side-card">
          <p className="side-label">PERSONALIZED GUIDANCE</p>
          <h3>
            Your next steps
            <br />
            <em>start here.</em>
          </h3>

          <p>
            Use these observations as a starting point. Choose gentle,
            suitable products and discontinue anything that causes irritation.
          </p>

          {Array.isArray(analysis.recommendations) &&
            analysis.recommendations.length > 0 && (
              <ul className="focus-list">
                {analysis.recommendations.map((item, index) => (
                  <li key={`${item}-${index}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{item}</strong>
                  </li>
                ))}
              </ul>
            )}
        </aside>
      </section>

      <section className="result-cta">
        <p className="eyebrow">NEXT STEP</p>
        <h2>
          Build your
          <br />
          <em>routine.</em>
        </h2>
        <p>Explore products matched to your skin profile.</p>

        <div className="result-actions">
          <button
            type="button"
            className="primary-button"
            onClick={saveProfile}
            disabled={saveStatus === "saving" || saveStatus === "saved"}
          >
            {saveStatus === "saving"
              ? "Saving Profile…"
              : saveStatus === "saved"
                ? "Profile Saved"
                : "Save My Profile"}
          </button>

          <Link
            to="/products?view=recommended&focus=skin"
            className="primary-button"
          >
            Explore My Recommendations →
          </Link>
        </div>
      </section>
    </main>
  );
}

export default SkinResult;
