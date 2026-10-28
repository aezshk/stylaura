import API_BASE_URL from ../api;
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const API_URL = "${API_BASE_URL}/api";

function Dashboard() {
  const { user } = useAuth();

  const [challenge, setChallenge] =
    useState(null);

  const [challengeLoading, setChallengeLoading] =
    useState(true);

  const userName =
    user?.name || "Your";

  useEffect(() => {
    const loadChallenge = async () => {
      try {
        const response = await fetch(
          `${API_URL}/challenges/latest`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load challenge result."
          );
        }

        setChallenge(data.result || null);
      } catch (error) {
        console.error(
          "Dashboard challenge error:",
          error
        );

        setChallenge(null);
      } finally {
        setChallengeLoading(false);
      }
    };

    loadChallenge();
  }, []);

  const skinAnalysed =
    Boolean(user?.skinProfile);

  const hairAnalysed =
    Boolean(user?.hairProfile);

  const colourAnalysed =
    Boolean(user?.colourProfile);

  const completedProfiles = [
    skinAnalysed,
    hairAnalysed,
    colourAnalysed,
  ].filter(Boolean).length;

  return (
    <main className="dashboard-page">

      {/* HEADER */}
      <section className="dashboard-header">
        <div>
          <p className="eyebrow">
            MY STYLAURA
          </p>

          <h1>
            Welcome,
            <br />
            <span>{userName}.</span>
          </h1>

          <p className="dashboard-intro">
            Your personalized beauty journey
            starts here. Explore your analysis
            results, style challenge rewards and
            recommendations designed around you.
          </p>
        </div>

        <div className="dashboard-header-mark">
          <span>✦</span>
        </div>
      </section>


      {/* PROFILE SUMMARY */}
      <section className="dashboard-summary">

        <div className="summary-card">
          <span className="summary-number">
            01
          </span>

          <p className="card-label">
            SKIN PROFILE
          </p>

          <h2>
            {user?.skinProfile?.skinType ||
              "Not analysed"}
          </h2>

          <p>
            Your skin profile and personalized
            skincare needs.
          </p>

          <Link to="/skin-analysis">
            {skinAnalysed
              ? "View Skin Analysis →"
              : "Start Skin Analysis →"}
          </Link>
        </div>


        <div className="summary-card">
          <span className="summary-number">
            02
          </span>

          <p className="card-label">
            HAIR PROFILE
          </p>

          <h2>
            {user?.hairProfile?.hairType ||
              "Not analysed"}
          </h2>

          <p>
            Discover your hair type and build
            a routine around your needs.
          </p>

          <Link to="/hair-analysis">
            {hairAnalysed
              ? "View Hair Analysis →"
              : "Start Hair Analysis →"}
          </Link>
        </div>


        <div className="summary-card">
          <span className="summary-number">
            03
          </span>

          <p className="card-label">
            COLOUR PROFILE
          </p>

          <h2>
            {user?.colourProfile?.undertone ||
              "Not analysed"}
          </h2>

          <p>
            Find colours and tones that
            complement your natural features.
          </p>

          <Link to="/colour-analysis">
            {colourAnalysed
              ? "View Colour Analysis →"
              : "Start Colour Analysis →"}
          </Link>
        </div>

      </section>


      {/* PROFILE PROGRESS */}
      <section className="dashboard-progress">

        <div>
          <p className="eyebrow">
            YOUR BEAUTY PROFILE
          </p>

          <h2>
            {completedProfiles}/3
            <br />
            <em>profiles complete.</em>
          </h2>
        </div>

        <div className="dashboard-progress-details">

          <div className="dashboard-progress-bar">
            <span
              style={{
                width: `${
                  (completedProfiles / 3) * 100
                }%`,
              }}
            />
          </div>

          <p>
            Complete your skin, hair and colour
            analyses to build your full STYLAURA
            profile.
          </p>

        </div>

      </section>


      {/* STYLE CHALLENGE */}
      <section className="dashboard-challenge">

        <div className="dashboard-challenge-content">

          <p className="eyebrow">
            STYLAURA • STYLE CHALLENGE
          </p>

          {challengeLoading ? (
            <>
              <h2>
                Checking your
                <br />
                <em>latest reward.</em>
              </h2>

              <p>
                Loading your latest challenge
                result.
              </p>
            </>
          ) : challenge ? (
            <>
              <h2>
                {challenge.passed
                  ? "Your style is"
                  : "Your reward is"}
                <br />
                <em>
                  {challenge.passed
                    ? "unlocked."
                    : "waiting."}
                </em>
              </h2>

              <p>
                You scored{" "}
                <strong>
                  {challenge.score}/100
                </strong>{" "}
                for your{" "}
                <strong>
                  {challenge.occasion}
                </strong>{" "}
                style challenge.
              </p>

              {challenge.passed ? (
                <p>
                  Partner brands are unlocked.
                  Keep exploring your collection.
                </p>
              ) : (
                <p>
                  You earned{" "}
                  <strong>
                    {challenge.discountPercent}%
                    off
                  </strong>{" "}
                  STYLAURA products.
                </p>
              )}

              <Link
                to="/products"
                className="dashboard-button"
              >
                Explore Your Reward
              </Link>
            </>
          ) : (
            <>
              <h2>
                Discover your
                <br />
                <em>style.</em>
              </h2>

              <p>
                Take the STYLAURA Style Challenge
                and unlock a personalized reward.
              </p>

              <Link
                to="/game"
                className="dashboard-button"
              >
                Take the Style Challenge
              </Link>
            </>
          )}

        </div>

        <div className="dashboard-challenge-score">
          {challenge ? (
            <>
              <strong>
                {challenge.score}
              </strong>

              <span>
                /100
              </span>
            </>
          ) : (
            <span>
              PLAY
            </span>
          )}
        </div>

      </section>


      {/* ROUTINE */}
      <section className="dashboard-routine">

        <div className="routine-content">

          <p className="eyebrow">
            YOUR PERSONALIZED ROUTINE
          </p>

          <h2>
            From your profile
            <br />
            to your <span>routine.</span>
          </h2>

          <p>
            Explore products selected to
            complement your personalized skin,
            hair and colour profile.
          </p>

          <Link
            to="/products"
            className="dashboard-button"
          >
            Explore Products
          </Link>

        </div>

        <div className="routine-art">
          <div className="routine-circle">
            <div className="routine-inner">
              <span>
                STYLAURA
              </span>
            </div>
          </div>
        </div>

      </section>


      {/* QUICK ACTIONS */}
      <section className="dashboard-actions">

        <div className="actions-heading">
          <p className="eyebrow">
            QUICK ACCESS
          </p>

          <h2>
            Continue your
            <br />
            <span>journey.</span>
          </h2>
        </div>


        <div className="action-links">

          <Link to="/skin-analysis">
            <span>
              Skin Analysis
            </span>
            <strong>→</strong>
          </Link>

          <Link to="/hair-analysis">
            <span>
              Hair Analysis
            </span>
            <strong>→</strong>
          </Link>

          <Link to="/colour-analysis">
            <span>
              Colour Analysis
            </span>
            <strong>→</strong>
          </Link>

          <Link to="/game">
            <span>
              Style Challenge
            </span>
            <strong>→</strong>
          </Link>

          <Link to="/products">
            <span>
              Beauty Products
            </span>
            <strong>→</strong>
          </Link>

          <Link to="/orders">
            <span>
              My Orders
            </span>
            <strong>→</strong>
          </Link>

        </div>

      </section>

    </main>
  );
}

export default Dashboard;