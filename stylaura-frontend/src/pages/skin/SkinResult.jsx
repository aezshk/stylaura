
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../api";
import { useAuth } from "../../context/AuthContext";

const SAVE_ENDPOINT = `${API_BASE_URL}/api/auth/skin-profile`;

const SKIN_GUIDES = {
  Dry: {
    summary:
      "Your general care guide focuses on supporting skin comfort and reducing feelings of dryness.",
    hydration: "Focus on gentle moisturising",
    texture: "Use gentle products",
    sensitivity: "Introduce products gradually",
    recommendations: [
      "Use a gentle cleanser that does not leave your skin feeling tight.",
      "Apply a moisturiser suited to your skin.",
      "Avoid very hot water and harsh exfoliation.",
      "Introduce new products one at a time.",
    ],
  },
  Oily: {
    summary:
      "Your general care guide focuses on gentle cleansing and lightweight moisturising.",
    hydration: "Use a lightweight moisturiser",
    texture: "Keep the routine gentle",
    sensitivity: "Avoid over-cleansing",
    recommendations: [
      "Use a gentle cleanser rather than repeatedly washing your face.",
      "Consider a lightweight, non-comedogenic moisturiser.",
      "Use broad-spectrum sunscreen during the day.",
      "Avoid harsh scrubs that may irritate your skin.",
    ],
  },
  Combination: {
    summary:
      "Your general care guide focuses on balancing comfort across different areas of the face.",
    hydration: "Adjust moisturiser to your needs",
    texture: "Keep care balanced",
    sensitivity: "Choose gentle products",
    recommendations: [
      "Use a gentle cleanser across your face.",
      "Apply moisturiser according to the needs of different areas.",
      "Use broad-spectrum sunscreen during the day.",
      "Avoid adding several new products at once.",
    ],
  },
  Normal: {
    summary:
      "Your general care guide focuses on maintaining a comfortable, consistent skin-care routine.",
    hydration: "Maintain comfortable hydration",
    texture: "Keep a simple routine",
    sensitivity: "Monitor product reactions",
    recommendations: [
      "Cleanse gently without over-washing.",
      "Use a moisturiser that feels comfortable on your skin.",
      "Use broad-spectrum sunscreen during the day.",
      "Introduce new products gradually.",
    ],
  },
  Sensitive: {
    summary:
      "Your general care guide focuses on a simple routine and reducing potential irritation.",
    hydration: "Use a gentle moisturiser",
    texture: "Avoid harsh exfoliation",
    sensitivity: "Prioritise gentle products",
    recommendations: [
      "Choose fragrance-free products when possible.",
      "Patch-test new products according to their instructions.",
      "Avoid introducing multiple active ingredients at once.",
      "Stop using products that cause irritation and seek professional advice if symptoms persist.",
    ],
  },
};

function SkinResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const image = location.state?.image;
  const selectedSkinType = location.state?.skinType;
  const selectedConcern = location.state?.concern;

  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle");

  useEffect(() => {
    // No paid AI or photo-analysis request is made here.
    const type = selectedSkinType || "Normal";
    const guide = SKIN_GUIDES[type] || SKIN_GUIDES.Normal;

    setAnalysis({
      mode: "rule_based",
      photoAnalyzed: false,
      skinType: type,
      concern: selectedConcern || "",
      hydration: guide.hydration,
      texture: guide.texture,
      sensitivity: guide.sensitivity,
      summary: guide.summary,
      recommendations: guide.recommendations,
    });
  }, [selectedSkinType, selectedConcern]);

  const saveProfile = async () => {
    if (!analysis || saveStatus === "saving" || saveStatus === "saved") {
      return;
    }

    setSaveStatus("saving");
    setError("");

    try {
      const response = await fetch(SAVE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          image: image || null,
          skinProfile: analysis,
          ...analysis,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to save your skin profile. Please sign in again."
        );
      }

      setSaveStatus("saved");

      if (typeof checkAuth === "function") {
        await checkAuth();
      }
    } catch (err) {
      console.error("Skin profile save error:", err);
      setError(err.message || "Unable to save your profile.");
      setSaveStatus("error");
    }
  };

  if (!analysis) {
    return (
      <main className="result-page skin-result-page">
        <section className="result-intro" aria-live="polite">
          <p className="eyebrow">STYLAURA · SKIN CARE</p>
          <h1>
            Preparing your
            <br />
            <em>care guide.</em>
          </h1>
          <p role="status">Preparing your free guide…</p>
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
        <p className="eyebrow">STYLAURA · YOUR SKIN CARE GUIDE</p>

        <h1>
          Care for your skin,
          <br />
          <em>your way.</em>
        </h1>

        <p>
          This free guide offers general skin-care suggestions. Your
          uploaded photo has not been analyzed, and this guide cannot
          diagnose a skin condition.
        </p>

        <p className="profile-save-status" role="note">
          Free care guide · No paid AI service required
        </p>

        {saveStatus === "saved" && (
          <p className="profile-save-status" role="status">
            Your skin profile has been saved.
          </p>
        )}

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
      </section>

      <section className="result-content">
        <article className="result-main-card">
          <header className="result-card-header">
            <div>
              <p className="result-label">YOUR SELECTED PROFILE</p>
              <h2>{analysis.skinType}</h2>
            </div>
            <span className="result-score">FREE CARE GUIDE</span>
          </header>

          {image && (
            <div className="skin-result-image">
              <img
                src={image}
                alt="Photo selected for the skin-care session; not analyzed"
              />
              <p>This is your selected photo. It was not analyzed.</p>
            </div>
          )}

          <div className="result-stats">
            {fields.map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value || "General guidance"}</strong>
              </div>
            ))}
          </div>

          {analysis.concern && (
            <section className="hair-observations">
              <h3>Your selected concern</h3>
              <p>{analysis.concern}</p>
            </section>
          )}

          <section className="hair-observations">
            <h3>About your care guide</h3>
            <p>{analysis.summary}</p>
          </section>
        </article>

        <aside className="result-side-card">
          <p className="side-label">GENERAL SKIN-CARE GUIDANCE</p>

          <h3>
            Your next steps
            <br />
            <em>start here.</em>
          </h3>

          <p>
            These suggestions are general cosmetic guidance, not
            photo-based findings or a medical diagnosis. Stop using
            products that irritate your skin.
          </p>

          <ul className="focus-list">
            {analysis.recommendations.map((item, index) => (
              <li key={`${index}-${item}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item}</strong>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="result-cta">
        <p className="eyebrow">NEXT STEP</p>

        <h2>
          Build your
          <br />
          <em>routine.</em>
        </h2>

        <p>
          Explore products that may suit your skin-care preferences.
        </p>

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
                : saveStatus === "error"
                  ? "Try Saving Again"
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
