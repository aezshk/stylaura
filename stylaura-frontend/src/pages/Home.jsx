import { Link } from 'react-router-dom'

function Home() {
  return (
    <main className="home-page">

      {/* HERO */}
      <section className="hero-section">

        <div className="hero-content">

          <p className="eyebrow">
            PERSONALIZED BEAUTY • STYLAURA
          </p>

          <h1>
            Beauty that
            <br />
            begins with
            <br />
            <span>you.</span>
          </h1>

          <p className="hero-description">
            Discover your skin, hair and colour profile
            and receive personalized beauty recommendations
            designed around you.
          </p>

          <div className="hero-actions">

            <Link
              to="/skin-analysis"
              className="primary-button"
            >
              Start Your Analysis
            </Link>

            <Link
              to="/products"
              className="secondary-button"
            >
              Explore Products
            </Link>

          </div>

        </div>


        <div className="hero-art">

          <div className="hero-circle">

            <div className="hero-inner-circle">
              <span>✦</span>
            </div>

          </div>

        </div>

      </section>


      {/* INTRO */}
      <section className="intro-section">

        <p className="eyebrow">
          YOUR BEAUTY PROFILE
        </p>

        <h2>
          Understand what makes
          <br />
          <span>you unique.</span>
        </h2>

        <p className="intro-text">
          STYLAURA combines personalized analysis
          with carefully selected beauty products
          to help you build a routine that fits you.
        </p>

      </section>


      {/* ANALYSIS */}
      <section className="analysis-section">

        {/* SKIN */}
        <div className="analysis-card">

          <span className="card-number">
            01
          </span>

          <div>

            <p className="card-label">
              SKIN
            </p>

            <h3>
              Discover your
              <br />
              skin profile.
            </h3>

            <p>
              Analyze your skin and discover
              characteristics such as redness,
              texture and pigmentation.
            </p>

          </div>

          <Link to="/skin-analysis">
            Explore Skin Analysis →
          </Link>

        </div>


        {/* HAIR */}
        <div className="analysis-card">

          <span className="card-number">
            02
          </span>

          <div>

            <p className="card-label">
              HAIR
            </p>

            <h3>
              Understand your
              <br />
              hair needs.
            </h3>

            <p>
              Select your hair type and concerns
              to discover personalized haircare
              recommendations.
            </p>

          </div>

          <Link to="/hair-analysis">
            Explore Hair Analysis →
          </Link>

        </div>


        {/* COLOUR */}
        <div className="analysis-card">

          <span className="card-number">
            03
          </span>

          <div>

            <p className="card-label">
              COLOUR
            </p>

            <h3>
              Find colours that
              <br />
              complement you.
            </h3>

            <p>
              Discover your undertone and explore
              a personalized colour palette.
            </p>

          </div>

          <Link to="/colour-analysis">
            Explore Colour Analysis →
          </Link>

        </div>

      </section>


      {/* RECOMMENDATIONS */}
      <section className="recommendation-section">

        <p className="eyebrow">
          PERSONALIZED RECOMMENDATIONS
        </p>

        <h2>
          From analysis
          <br />
          to your <span>routine.</span>
        </h2>

        <p>
          Your STYLAURA profile helps you discover
          personalized skincare and haircare products
          suited to your individual needs.
        </p>

        <Link
          to="/products"
          className="primary-button"
        >
          Discover Your Routine
        </Link>

      </section>

    </main>
  )
}

export default Home