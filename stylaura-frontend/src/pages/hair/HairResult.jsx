import API_BASE_URL from "../../api";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

function HairResult() {
  const location = useLocation();
  const { checkAuth } = useAuth();


  const hairType = location.state?.hairType || "Wavy";
  const concern = location.state?.concern || "Frizz";
  const image = location.state?.image;

  const [saveStatus, setSaveStatus] = useState("saving");

  useEffect(() => {
    const saveProfile = async () => {
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
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to save hair profile."
          );
        }

        setSaveStatus("saved");
      } catch (error) {
        console.error(
          "Hair profile save error:",
          error
        );

        setSaveStatus("error");
      }
    };

    saveProfile();
  }, [image, hairType, concern]);

  return (
    <main className="result-page hair-result-page">

      <section className="result-intro">

        <p className="eyebrow">
          STYLAURA • YOUR HAIR PROFILE
        </p>

        <h1>
          Your hair,
          <br />
          <em>understood.</em>
        </h1>

        <p>
          Your answers give us a starting point
          for understanding your hair and creating
          a more personalized care routine.
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

        <div className="result-main-card hair-result-main">

          <div className="result-card-header">

            <div>

              <p className="result-label">
                HAIR PROFILE
              </p>

              <h2>
                {hairType}
              </h2>

            </div>

            <span className="result-score">
              PERSONALIZED PROFILE
            </span>

          </div>

          <div className="hair-result-photo">

            {image ? (
              <img
                src={image}
                alt="Hair analysis"
              />
            ) : (
              <div className="hair-result-placeholder">

                <span>
                  ✦
                </span>

                <p>
                  No hair photo was provided.
                </p>

              </div>
            )}

          </div>

          <div className="result-stats">

            <div>
              <span>Hair Type</span>
              <strong>{hairType}</strong>
            </div>

            <div>
              <span>Main Concern</span>
              <strong>{concern}</strong>
            </div>

            <div>
              <span>Routine Focus</span>
              <strong>Care & Balance</strong>
            </div>

          </div>

        </div>

        <aside className="result-side-card hair-result-side">

          <p className="side-label">
            WHAT WE RECOMMEND
          </p>

          <h3>
            Give your hair
            <br />
            the care
            <br />
            <em>it deserves.</em>
          </h3>

          <p>
            Your profile can guide you toward
            products that support your hair type
            while addressing your main concern.
          </p>

          <div className="focus-list">

            <div>
              <span>01</span>
              <strong>Gentle cleansing</strong>
            </div>

            <div>
              <span>02</span>
              <strong>Targeted treatment</strong>
            </div>

            <div>
              <span>03</span>
              <strong>Consistent care</strong>
            </div>

          </div>

        </aside>

      </section>

      <section className="result-cta hair-result-cta">

        <p className="eyebrow">
          NEXT STEP
        </p>

        <h2>
          Find your
          <br />
          <em>hair routine.</em>
        </h2>

        <p>
          Explore products selected to complement
          your hair profile and everyday needs.
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