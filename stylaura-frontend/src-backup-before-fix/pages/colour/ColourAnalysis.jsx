import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ColourAnalysis() {
  const navigate = useNavigate();

  const [undertone, setUndertone] = useState("");
  const [contrast, setContrast] = useState("");

  const undertones = [
    {
      name: "Warm",
      description: "Golden, peachy or yellow undertones",
    },
    {
      name: "Cool",
      description: "Pink, rosy or bluish undertones",
    },
    {
      name: "Neutral",
      description: "A balanced mix of warm and cool",
    },
  ];

  const contrastLevels = [
    {
      name: "Low",
      description: "Soft differences between your features",
    },
    {
      name: "Medium",
      description: "Noticeable but balanced contrast",
    },
    {
      name: "High",
      description: "Strong differences between your features",
    },
  ];

  const handleContinue = () => {
    if (!undertone || !contrast) return;

    navigate("/colour-analysis/result", {
      state: {
        undertone,
        contrast,
      },
    });
  };

  return (
    <main className="analysis-page colour-analysis-page">

      {/* TOP BAR */}
      


      {/* MAIN */}
      <section className="colour-analysis-main">

        {/* INTRO */}
        <div className="analysis-intro">

          <p className="eyebrow">
            STYLAURA • COLOUR ANALYSIS
          </p>

          <h1>
            Find colours that
            <br />
            <em>complement you.</em>
          </h1>

          <p className="analysis-description">
            Discover the tones and colour characteristics
            that naturally work with your features.
          </p>

        </div>


        {/* CONTENT */}
        <div className="colour-analysis-layout">

          {/* QUESTIONS */}
          <div className="colour-form-card">

            {/* UNDERTONE */}
            <div className="colour-question">

              <div className="question-heading">

                <span className="question-number">
                  01
                </span>

                <div>

                  <p className="question-label">
                    UNDERTONE
                  </p>

                  <h2>
                    Which undertone feels
                    right for you?
                  </h2>

                </div>

              </div>


              <div className="colour-options">

                {undertones.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    className={
                      undertone === item.name
                        ? "colour-option selected"
                        : "colour-option"
                    }
                    onClick={() =>
                      setUndertone(item.name)
                    }
                  >

                    <span
                      className={`colour-swatch ${item.name.toLowerCase()}`}
                    />

                    <span className="colour-option-text">

                      <strong>
                        {item.name}
                      </strong>

                      <small>
                        {item.description}
                      </small>

                    </span>

                    {undertone === item.name && (
                      <span className="option-check">
                        ✓
                      </span>
                    )}

                  </button>
                ))}

              </div>

            </div>


            <div className="question-separator" />


            {/* CONTRAST */}
            <div className="colour-question">

              <div className="question-heading">

                <span className="question-number">
                  02
                </span>

                <div>

                  <p className="question-label">
                    FEATURE CONTRAST
                  </p>

                  <h2>
                    How much contrast do
                    your features have?
                  </h2>

                </div>

              </div>


              <div className="colour-options">

                {contrastLevels.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    className={
                      contrast === item.name
                        ? "colour-option selected"
                        : "colour-option"
                    }
                    onClick={() =>
                      setContrast(item.name)
                    }
                  >

                    <span
                      className={`contrast-preview ${item.name.toLowerCase()}`}
                    />

                    <span className="colour-option-text">

                      <strong>
                        {item.name}
                      </strong>

                      <small>
                        {item.description}
                      </small>

                    </span>

                    {contrast === item.name && (
                      <span className="option-check">
                        ✓
                      </span>
                    )}

                  </button>
                ))}

              </div>

            </div>

          </div>


          {/* VISUAL SIDE */}
          <aside className="colour-side-card">

            <div className="colour-wheel">

              <span />
              <span />
              <span />
              <span />
              <span />
              <span />

            </div>

            <p className="side-label">
              YOUR COLOUR PROFILE
            </p>

            <h3>
              Colour should
              <br />
              feel like
              <br />
              <em>you.</em>
            </h3>

            <p>
              Your colour profile helps guide
              the tones that can complement
              your natural features.
            </p>


            <div className="colour-summary">

              <div>

                <span>
                  Undertone
                </span>

                <strong>
                  {undertone || "Not selected"}
                </strong>

              </div>


              <div>

                <span>
                  Contrast
                </span>

                <strong>
                  {contrast || "Not selected"}
                </strong>

              </div>

            </div>

          </aside>

        </div>


        {/* BOTTOM */}
        <div className="analysis-bottom">

          <p>
            Your selections will be used to
            create your personalized colour profile.
          </p>

          <button
            type="button"
            className="analysis-continue"
            disabled={!undertone || !contrast}
            onClick={handleContinue}
          >
            Continue to Result

            <span>
              →
            </span>

          </button>

        </div>

      </section>

    </main>
  );
}

export default ColourAnalysis;