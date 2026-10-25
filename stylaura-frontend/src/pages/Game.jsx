import API_BASE_URL from "../api";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const occasions = [
  {
    id: "wedding",
    title: "Wedding",
    description: "Elegant, polished and celebration-ready.",
  },
  {
    id: "date",
    title: "Date Night",
    description: "Effortless, confident and a little glamorous.",
  },
  {
    id: "office",
    title: "Office",
    description: "Fresh, refined and professionally styled.",
  },
  {
    id: "vacation",
    title: "Vacation",
    description: "Relaxed, fresh and effortlessly beautiful.",
  },
  {
    id: "party",
    title: "Party",
    description: "Expressive, bold and ready for the night.",
  },
];

const challenges = [
  {
    id: 1,
    eyebrow: "ROUND 01 • SKIN PREP",
    question: "How would you prepare your skin?",
    options: [
      {
        id: "a",
        title: "Hydrate & Glow",
        description:
          "Light hydration with a luminous finish.",
        points: 25,
      },
      {
        id: "b",
        title: "Heavy Coverage",
        description:
          "Start with a full-coverage base.",
        points: 10,
      },
    ],
  },
  {
    id: 2,
    eyebrow: "ROUND 02 • HAIR",
    question: "Which hair direction fits the look?",
    options: [
      {
        id: "a",
        title: "Polished & Styled",
        description:
          "Clean, intentional and put together.",
        points: 25,
      },
      {
        id: "b",
        title: "Anything Goes",
        description:
          "Keep it completely spontaneous.",
        points: 10,
      },
    ],
  },
  {
    id: 3,
    eyebrow: "ROUND 03 • COLOUR",
    question: "Choose your colour approach.",
    options: [
      {
        id: "a",
        title: "Balanced Palette",
        description:
          "Colours that complement the complete look.",
        points: 25,
      },
      {
        id: "b",
        title: "Every Colour",
        description:
          "More colour always means more impact.",
        points: 10,
      },
    ],
  },
  {
    id: 4,
    eyebrow: "ROUND 04 • FINISH",
    question: "How would you finish the look?",
    options: [
      {
        id: "a",
        title: "Complete The Story",
        description:
          "Make every detail work together.",
        points: 25,
      },
      {
        id: "b",
        title: "Keep It Random",
        description:
          "Let every detail be a surprise.",
        points: 10,
      },
    ],
  },
];

function Game() {
  const navigate = useNavigate();

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stage, setStage] = useState("intro");
  const [occasion, setOccasion] = useState(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);

  const [savingResult, setSavingResult] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/games`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load games."
          );
        }

        setGames(data.games || []);
      } catch (err) {
        console.error(
          "Game loading failed:",
          err
        );

        setError(
          err.message ||
            "Unable to load games."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const activeGame = games[0];

  const startChallenge = () => {
    setStage("occasion");
    setError("");
  };

  const selectOccasion = (selectedOccasion) => {
    setOccasion(selectedOccasion);
    setCurrentRound(0);
    setAnswers({});
    setScore(0);
    setResultSaved(false);
    setStage("challenge");
  };

  const saveChallengeResult = async (
    finalScore
  ) => {
    try {
      setSavingResult(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/challenges/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            gameId: activeGame._id,
            occasion: occasion.id,
            score: finalScore,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save your challenge result."
        );
      }

      setResultSaved(true);

      return data.result;
    } catch (err) {
      console.error(
        "Saving challenge result failed:",
        err
      );

      setError(
        err.message ||
          "Unable to save your challenge result."
      );

      return null;
    } finally {
      setSavingResult(false);
    }
  };

  const selectAnswer = async (option) => {
    if (savingResult) {
      return;
    }

    const challenge = challenges[currentRound];

    const newAnswers = {
      ...answers,
      [challenge.id]: option.id,
    };

    setAnswers(newAnswers);

    const newScore = score + option.points;

    setScore(newScore);

    if (currentRound < challenges.length - 1) {
      setTimeout(() => {
        setCurrentRound(
          (current) => current + 1
        );
      }, 250);

      return;
    }

    const savedResult =
      await saveChallengeResult(
        newScore
      );

    if (savedResult) {
      setStage("result");
    }
  };

  const restartChallenge = () => {
    setStage("intro");
    setOccasion(null);
    setCurrentRound(0);
    setAnswers({});
    setScore(0);
    setError("");
    setResultSaved(false);
  };

  const passed = score >= 80;

  const handleContinue = () => {
    if (!resultSaved) {
      return;
    }

    if (passed) {
      navigate("/products?source=partner");
    } else {
      navigate("/products?source=stylaura");
    }
  };

  if (loading) {
    return (
      <main className="game-page">
        <section className="game-state">
          <p>
            Loading the Style Challenge...
          </p>
        </section>
      </main>
    );
  }

  if (error && stage === "intro") {
    return (
      <main className="game-page">
        <section className="game-state game-error">
          <p>{error}</p>
        </section>
      </main>
    );
  }

  if (!activeGame) {
    return (
      <main className="game-page">
        <section className="game-state">
          <p className="eyebrow">
            NOTHING LIVE YET
          </p>

          <h2>
            A new challenge is
            <br />
            <em>coming soon.</em>
          </h2>

          <p>
            Check back soon for the next
            STYLAURA Style Challenge.
          </p>

          <Link
            to="/dashboard"
            className="primary-button"
          >
            Back to Profile
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="game-page">
      <section className="game-hero">
        <p className="eyebrow">
          STYLAURA • PLAY & UNLOCK
        </p>

        <h1>
          The Style
          <br />
          <em>Challenge.</em>
        </h1>

        <p className="game-intro">
          Make the right styling choices, build
          your score and discover where your
          STYLAURA journey takes you.
        </p>
      </section>

      {stage === "intro" && (
        <section className="style-challenge-card">
          <div className="challenge-number">
            01
          </div>

          <p className="challenge-eyebrow">
            YOUR CHALLENGE
          </p>

          <h2>
            Build a look.
            <br />
            <em>Make every choice count.</em>
          </h2>

          <p className="challenge-description">
            Choose your occasion and complete
            four styling decisions. Score 80 or
            more to unlock our partner-brand
            collection.
          </p>

          <div className="challenge-rules">
            <div>
              <strong>4</strong>
              <span>Rounds</span>
            </div>

            <div>
              <strong>100</strong>
              <span>Maximum score</span>
            </div>

            <div>
              <strong>80</strong>
              <span>Pass score</span>
            </div>
          </div>

          <button
            type="button"
            className="primary-button challenge-start-button"
            onClick={startChallenge}
          >
            Start Challenge
          </button>
        </section>
      )}

      {stage === "occasion" && (
        <section className="style-challenge-card occasion-card">
          <p className="challenge-eyebrow">
            STEP 01 • CHOOSE YOUR OCCASION
          </p>

          <h2>
            Where are you
            <br />
            <em>going?</em>
          </h2>

          <div className="occasion-grid">
            {occasions.map((item) => (
              <button
                key={item.id}
                type="button"
                className="occasion-option"
                onClick={() =>
                  selectOccasion(item)
                }
              >
                <span>
                  {item.title}
                </span>

                <small>
                  {item.description}
                </small>
              </button>
            ))}
          </div>
        </section>
      )}

      {stage === "challenge" && (
        <section className="style-challenge-card">
          <div className="challenge-progress">
            <span>
              ROUND {currentRound + 1} OF{" "}
              {challenges.length}
            </span>

            <span>
              {score} POINTS
            </span>
          </div>

          <div className="challenge-progress-bar">
            <span
              style={{
                width: `${
                  ((currentRound + 1) /
                    challenges.length) *
                  100
                }%`,
              }}
            />
          </div>

          <p className="challenge-eyebrow">
            {
              challenges[currentRound]
                .eyebrow
            }
          </p>

          <h2>
            {
              challenges[currentRound]
                .question
            }
          </h2>

          <p className="challenge-context">
            Styling for{" "}
            <strong>
              {occasion?.title}
            </strong>
          </p>

          <div className="challenge-options">
            {challenges[
              currentRound
            ].options.map((option) => (
              <button
                key={option.id}
                type="button"
                className="challenge-option"
                disabled={savingResult}
                onClick={() =>
                  selectAnswer(option)
                }
              >
                <span className="option-letter">
                  {option.id.toUpperCase()}
                </span>

                <span className="option-content">
                  <strong>
                    {option.title}
                  </strong>

                  <small>
                    {option.description}
                  </small>
                </span>

                <span className="option-arrow">
                  →
                </span>
              </button>
            ))}
          </div>

          {savingResult && (
            <p className="challenge-saving">
              Saving your result...
            </p>
          )}

          {error && (
            <p className="challenge-error">
              {error}
            </p>
          )}
        </section>
      )}

      {stage === "result" && (
        <section className="style-challenge-card result-card">
          <p className="challenge-eyebrow">
            CHALLENGE COMPLETE
          </p>

          <div
            className={`result-score ${
              passed
                ? "result-pass"
                : "result-fail"
            }`}
          >
            {score}
          </div>

          <p className="result-score-label">
            OUT OF 100
          </p>

          {passed ? (
            <>
              <h2>
                You passed.
                <br />
                <em>Your style has range.</em>
              </h2>

              <p className="challenge-description">
                Your choices show strong
                styling instincts. You've
                unlocked access to STYLAURA's
                partner-brand collection.
              </p>

              <div className="result-reward">
                <span>UNLOCKED</span>

                <strong>
                  Partner Brands
                </strong>

                <small>
                  Explore products beyond
                  STYLAURA.
                </small>
              </div>
            </>
          ) : (
            <>
              <h2>
                Almost there.
                <br />
                <em>
                  Let's keep discovering.
                </em>
              </h2>

              <p className="challenge-description">
                Your style journey continues
                with STYLAURA. We've unlocked
                a special discount for your
                next purchase.
              </p>

              <div className="result-reward">
                <span>UNLOCKED</span>

                <strong>
                  STYLAURA Discount
                </strong>

                <small>
                  Your exclusive reward awaits.
                </small>
              </div>
            </>
          )}

          <div className="result-actions">
            <button
              type="button"
              className="primary-button"
              onClick={handleContinue}
              disabled={!resultSaved}
            >
              {passed
                ? "Explore Partner Brands"
                : "Shop STYLAURA"}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={restartChallenge}
            >
              Play Again
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

export default Game;