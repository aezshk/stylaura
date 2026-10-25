import API_BASE_URL from "../../api";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

function SkinResult() {
  const location = useLocation();

  const image = location.state?.image;

  const skinProfile = {
    image: image || null,
    skinType: "Combination",
    hydration: "Moderate",
    texture: "Balanced",
    sensitivity: "Low",
  };

  const [saveStatus, setSaveStatus] = useState("saving");

  useEffect(() => {
    const saveProfile = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/auth/skin-profile`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(skinProfile),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to save skin profile."
          );
        }

        setSaveStatus("saved");
      } catch (error) {
        console.error(
          "Skin profile save error:",
          error
        );

        setSaveStatus("error");
      }
    };

    saveProfile();
  }, [image]);

  return (
    <main className="result-page skin-result-page">

      <section className="result-intro">

        <p className="eyebrow">
          STYLAURA • YOUR SKIN PROFILE
        </p>

        <h1>
          Your skin,
          <br />
          <em>understood.</em>
        </h1>

        <p>
          Based on your analysis, here is a
          personalized starting point for your
          skincare routine.
        </p>

        {saveStatus === "saved" && (
          <p className="profile-save-status">
            Your profile has been saved.
          </p>
        )}

        {saveStatus === "error" && (
          <p className="auth-error">
            We couldn't save your profile.
            Please make sure you're logged in.
          </p>
        )}

      </section>

      <section className="result-content">

        <div className="result-main-card">

          <div className="result-card-header">

            <div>
              <p className="result-label">
                SKIN PROFILE
              </p>

              <h2>
                Combination
              </h2>
            </div>

            <span className="result-score">
              YOUR PROFILE
            </span>

          </div>

          <div className="skin-result-image">

            {image ? (
              <img
                src={image}
                alt="Skin analysis preview"
              />
            ) : (
              <div className="skin-placeholder">
                <span>✦</span>

                <p>
                  Your analysis image
                </p>
              </div>
            )}

          </div>

          <div className="result-stats">

            <div>
              <span>Hydration</span>
              <strong>Moderate</strong>
            </div>

            <div>
              <span>Texture</span>
              <strong>Balanced</strong>
            </div>

            <div>
              <span>Sensitivity</span>
              <strong>Low</strong>
            </div>

          </div>

        </div>

        <aside className="result-side-card">

          <p className="side-label">
            WHAT WE NOTICED
          </p>

          <h3>
            Your skin
            <br />
            needs
            <br />
            <em>balance.</em>
          </h3>

          <p>
            Your profile suggests focusing
            on maintaining hydration while
            supporting a balanced, comfortable
            skin barrier.
          </p>

          <div className="focus-list">

            <div>
              <span>01</span>
              <strong>Hydration</strong>
            </div>

            <div>
              <span>02</span>
              <strong>Texture</strong>
            </div>

            <div>
              <span>03</span>
              <strong>Daily Protection</strong>
            </div>

          </div>

        </aside>

      </section>

      <section className="result-cta">

        <p className="eyebrow">
          NEXT STEP
        </p>

        <h2>
          Build your
          <br />
          <em>routine.</em>
        </h2>

        <p>
          Explore products selected around
          your personalized skin profile.
        </p>

        
      <Link
        to="/products?view=recommended&focus=skin"
        className="primary-button"
      >
        Explore My Recommendations →
      </Link>


      </section>

    </main>
  );
}

export default SkinResult;