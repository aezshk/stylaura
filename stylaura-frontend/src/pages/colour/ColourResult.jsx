import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

function ColourResult() {
  const location = useLocation();

  const undertone =
    location.state?.undertone || "Neutral";

  const contrast =
    location.state?.contrast || "Medium";

  const palettes = {
    Warm: [
      "#C97862",
      "#D5A45F",
      "#B9825D",
      "#8F6A4D",
      "#D7C28B",
      "#6F7650",
    ],

    Cool: [
      "#8D9FCA",
      "#9A89A8",
      "#758FA0",
      "#6E788E",
      "#B8A9C9",
      "#596B70",
    ],

    Neutral: [
      "#B9967C",
      "#C7A889",
      "#8C7768",
      "#A9A39A",
      "#6F6A61",
      "#D2C3B4",
    ],
  };

  const palette =
    palettes[undertone] ||
    palettes.Neutral;

  const [saveStatus, setSaveStatus] =
    useState("saving");

  useEffect(() => {
    const saveProfile = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/colour-profile",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            credentials: "include",

            body: JSON.stringify({
              image:
                location.state?.image ||
                null,

              undertone,

              contrast,

              season: null,

              bestColours:
                palette,

              avoidColours: [],
            }),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to save colour profile."
          );
        }

        setSaveStatus("saved");
      } catch (error) {
        console.error(
          "Colour profile save error:",
          error
        );

        setSaveStatus("error");
      }
    };

    saveProfile();
  }, [
    undertone,
    contrast,
    palette,
    location.state?.image,
  ]);

  return (
    <main className="result-page colour-result-page">

      {/* INTRO */}

      <section className="result-intro">

        <p className="eyebrow">
          STYLAURA • YOUR COLOUR PROFILE
        </p>

        <h1>
          Colours that
          <br />
          <em>feel like you.</em>
        </h1>

        <p>
          Your colour profile gives you a
          personalized starting point for
          discovering tones that complement
          your natural features.
        </p>

      </section>


      {/* RESULTS */}

      <section className="result-content">

        {/* MAIN CARD */}

        <div className="result-main-card colour-result-main">

          <div className="result-card-header">

            <div>

              <p className="result-label">
                COLOUR PROFILE
              </p>

              <h2>
                {undertone} Tones
              </h2>

            </div>

            <span className="result-score">
              PERSONALIZED PALETTE
            </span>

          </div>


          {/* PALETTE */}

          <div className="colour-result-palette">

            <div className="palette-intro">

              <span>
                YOUR PALETTE
              </span>

              <strong>
                {undertone} • {contrast} contrast
              </strong>

            </div>


            <div className="palette-grid">

              {palette.map(
                (colour, index) => (
                  <div
                    key={`${colour}-${index}`}
                    className="palette-swatch"
                    style={{
                      backgroundColor:
                        colour,
                    }}
                  >
                    <span>
                      0{index + 1}
                    </span>
                  </div>
                )
              )}

            </div>

          </div>


          {/* STATS */}

          <div className="result-stats">

            <div>

              <span>
                Undertone
              </span>

              <strong>
                {undertone}
              </strong>

            </div>


            <div>

              <span>
                Contrast
              </span>

              <strong>
                {contrast}
              </strong>

            </div>


            <div>

              <span>
                Palette
              </span>

              <strong>
                {undertone} tones
              </strong>

            </div>

          </div>


          {/* SAVE STATUS */}

          <div className="profile-save-status">

            {saveStatus === "saving" && (
              <span>
                Saving your colour
                profile...
              </span>
            )}


            {saveStatus === "saved" && (
              <span>
                ✓ Your colour profile
                has been saved.
              </span>
            )}


            {saveStatus === "error" && (
              <span>
                Your colour result is
                ready, but we could not
                save it to your profile.
              </span>
            )}

          </div>

        </div>


        {/* SIDE CARD */}

        <aside className="result-side-card colour-result-side">

          <p className="side-label">
            YOUR COLOUR DIRECTION
          </p>

          <h3>
            Let your
            <br />
            colours
            <br />
            <em>shine.</em>
          </h3>

          <p>
            Use your personalized palette
            as a guide when choosing
            clothing, makeup, accessories
            and beauty details.
          </p>


          <div className="focus-list">

            <div>
              <span>01</span>

              <strong>
                Complement your undertone
              </strong>
            </div>


            <div>
              <span>02</span>

              <strong>
                Balance your contrast
              </strong>
            </div>


            <div>
              <span>03</span>

              <strong>
                Build your palette
              </strong>
            </div>

          </div>

        </aside>

      </section>


      {/* CTA */}

      <section className="result-cta colour-result-cta">

        <p className="eyebrow">
          NEXT STEP
        </p>

        <h2>
          Discover your
          <br />
          <em>beauty routine.</em>
        </h2>

        <p>
          Take what you have discovered
          and explore products selected
          around you.
        </p>

        
      <Link
        to="/products?view=recommended&focus=colour"
        className="primary-button"
      >
        Explore My Recommendations →
      </Link>


      </section>

    </main>
  );
}

export default ColourResult;