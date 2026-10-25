import API_BASE_URL from "../api";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const API_URL = `${API_BASE_URL}/api/products`;
const RECOMMENDATION_URL =
  `${API_BASE_URL}/api/recommendations`;
const CART_URL = `${API_BASE_URL}/api/cart`;

function Products() {
  const [searchParams] = useSearchParams();

  const recommendationView =
    searchParams.get("view") === "recommended";

  const [products, setProducts] = useState([]);
  const [challenge, setChallenge] = useState(null);

  const [recommendations, setRecommendations] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] =
    useState(true);

  const [error, setError] = useState("");
  const [recommendationError, setRecommendationError] =
    useState("");

  const [cartMessage, setCartMessage] = useState("");
  const [addingProductId, setAddingProductId] =
    useState(null);

  /*
    LOAD PRODUCTS
  */

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load products."
          );
        }

        setProducts(data.products || []);
        setChallenge(data.challenge || null);
      } catch (error) {
        console.error(
          "Products loading error:",
          error
        );

        setError(
          error.message ||
            "Unable to load products."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  /*
    LOAD PERSONALIZED RECOMMENDATIONS
  */


  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setRecommendationsLoading(true);
        setRecommendationError("");

        const focus = searchParams.get("focus") || "all";

        const response = await fetch(
          `${RECOMMENDATION_URL}?focus=${encodeURIComponent(focus)}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load recommendations."
          );
        }

        setRecommendations(data);
      } catch (error) {
        console.error(
          "Recommendations loading error:",
          error
        );

        setRecommendationError(
          error.message ||
            "Unable to load recommendations."
        );
      } finally {
        setRecommendationsLoading(false);
      }
    };

    loadRecommendations();
  }, [searchParams]);


  /*
    ADD TO CART
  */

  const addToCart = async (product) => {
    try {
      setAddingProductId(product._id);
      setCartMessage("");

      const response = await fetch(
        `${CART_URL}/items`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            productId: product._id,
            quantity: 1,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to add product to cart."
        );
      }

      setCartMessage(
        `${product.name} was added to your cart.`
      );
    } catch (error) {
      console.error(
        "Add to cart error:",
        error
      );

      setCartMessage(
        error.message ||
          "Unable to add product to cart."
      );
    } finally {
      setAddingProductId(null);
    }
  };

  /*
    STYLE CHALLENGE STATE
  */

  const passedChallenge =
    challenge?.passed === true;

  const failedChallenge =
    challenge?.hasResult === true &&
    challenge?.passed === false;

  const hasChallengeResult =
    challenge?.hasResult === true;

  const challengeDiscount =
    challenge?.discountPercent || 0;

  /*
    PRODUCT GROUPS
  */

  const stylAuraProducts =
    products.filter(
      (product) => product.isStylaura
    );

  const otherProducts =
    products.filter(
      (product) => !product.isStylaura
    );

  const visibleOtherProducts =
    passedChallenge
      ? otherProducts
      : [];

  /*
    PERSONALIZATION PROFILE
  */

  const profile =
    recommendations?.profile || {};

  const recommendationGroups =
    recommendations?.recommendations || {};

  const hasProfile =
    Boolean(
      profile.skinType ||
        profile.hairType ||
        profile.undertone ||
        profile.contrast
    );
    const focus =
  (searchParams.get("focus") || "all").toLowerCase();

  /*
    RECOMMENDATION CARD
  */

  const renderRecommendationCard = (
    product
  ) => {
    const discountedPrice =
      failedChallenge
        ? Number(product.price || 0) *
          (1 - challengeDiscount / 100)
        : Number(product.price || 0);

    return (
      <article
        key={product._id}
        className="product-card recommendation-product-card"
      >
        <div className="product-image">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
            />
          ) : (
            <span>
              {product.brand}
            </span>
          )}
        </div>

        <div className="product-card-content">
          <p className="product-brand">
            {product.brand}
          </p>

          <h3>
            {product.name}
          </h3>

          <p className="product-category">
            {product.category}
            {product.subcategory
              ? ` • ${product.subcategory}`
              : ""}
          </p>

          {product.description && (
            <p className="product-description">
              {product.description}
            </p>
          )}

          <div className="product-card-bottom">
            <div className="product-price-area">
              {failedChallenge && (
                <span className="product-original-price">
                  ₹
                  {Number(
                    product.price || 0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </span>
              )}

              <strong>
                ₹
                {discountedPrice.toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits: 0,
                  }
                )}
              </strong>
            </div>

            <span
              className={
                product.stock > 0
                  ? "product-stock"
                  : "product-stock out"
              }
            >
              {product.stock > 0
                ? `${product.stock} available`
                : "Out of stock"}
            </span>
          </div>

          <button
            type="button"
            className="product-add-button"
            disabled={
              product.stock <= 0 ||
              addingProductId ===
                product._id
            }
            onClick={() =>
              addToCart(product)
            }
          >
            {addingProductId ===
            product._id
              ? "Adding..."
              : product.stock > 0
              ? "Add to Cart"
              : "Out of Stock"}
          </button>
        </div>
      </article>
    );
  };

  /*
    PERSONALIZED SECTION
  */

  const renderRecommendationSection = (
    title,
    eyebrow,
    productsForCategory
  ) => {
    if (
      !productsForCategory ||
      productsForCategory.length === 0
    ) {
      return null;
    }

    return (
      <section className="products-section personalized-products-section">
        <div className="products-section-heading">
          <div>
            <p className="eyebrow">
              {eyebrow}
            </p>

            <h2>
              {title}
              <br />
              <em>for you.</em>
            </h2>
          </div>

          <span>
            {productsForCategory.length} matches
          </span>
        </div>

        <div className="products-grid">
          {productsForCategory.map(
            renderRecommendationCard
          )}
        </div>
      </section>
    );
  };

  /*
    LOADING
  */

  if (loading) {
    return (
      <main className="products-page">
        <section className="products-loading">
          <p className="eyebrow">
            STYLAURA
          </p>

          <h1>
            Loading your
            <br />
            <em>beauty collection.</em>
          </h1>
        </section>
      </main>
    );
  }

  /*
    ERROR
  */

  if (error) {
    return (
      <main className="products-page">
        <section className="products-error">
          <p className="eyebrow">
            STYLAURA • PRODUCTS
          </p>

          <h1>
            We couldn't load
            <br />
            <em>your collection.</em>
          </h1>

          <p>{error}</p>

          <button
            type="button"
            className="primary-button"
            onClick={() =>
              window.location.reload()
            }
          >
            Try Again
          </button>
        </section>
      </main>
    );
  }

  /*
    RECOMMENDATION VIEW
  */

  if (recommendationView) {
    return (
      <main className="products-page">

        <section className="products-hero">
          <div>
            <p className="eyebrow">
              STYLAURA • PERSONALIZED FOR YOU
            </p>

            <h1>
              Your personalized
              <br />
              <em>recommendations.</em>
            </h1>

            <p>
              Products selected around your
              saved skin, hair and colour profile.
            </p>
          </div>

          <Link
            to="/cart"
            className="products-profile-link"
          >
            View Cart →
          </Link>
        </section>

        {!recommendationsLoading &&
          hasProfile && (
            <section className="personalized-profile-banner">
              <div>
                <p className="eyebrow">
                  STYLAURA • YOUR PROFILE
                </p>

                <h2>
                  Recommendations made
                  <br />
                  <em>around you.</em>
                </h2>

                <p>
                  These products are matched to
                  your saved beauty profile.
                </p>
              </div>

            <div className="personalized-profile-tags">
              {(focus === "all" || focus === "skin") &&
                profile.skinType && (
                  <span>Skin • {profile.skinType}</span>
                )}

              {(focus === "all" || focus === "hair") &&
                profile.hairType && (
                  <span>Hair • {profile.hairType}</span>
                )}

              {(focus === "all" || focus === "colour") &&
                profile.undertone && (
                  <span>Undertone • {profile.undertone}</span>
                )}

              {(focus === "all" || focus === "colour") &&
                profile.contrast && (
                  <span>Contrast • {profile.contrast}</span>
                )}
            </div>
            </section> 
          )}

        {!recommendationsLoading &&
          !hasProfile &&
          !recommendationError && (
            <section className="products-empty">
              <h3>
                Complete your beauty profile
                first.
              </h3>

              <p>
                Complete your skin, hair or
                colour analysis so STYLAURA
                can create personalized
                recommendations for you.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginTop: "20px",
                }}
              >
                <Link
                  to="/skin-analysis"
                  className="secondary-button"
                >
                  Skin Analysis
                </Link>

                <Link
                  to="/hair-analysis"
                  className="secondary-button"
                >
                  Hair Analysis
                </Link>

                <Link
                  to="/colour-analysis"
                  className="secondary-button"
                >
                  Colour Analysis
                </Link>
              </div>
            </section>
          )}

        {recommendationError && (
          <div className="products-cart-message">
            <span>
              We couldn't load your personalized
              recommendations yet.
            </span>
          </div>
        )}

        {cartMessage && (
          <div className="products-cart-message">
            <span>
              {cartMessage}
            </span>

            <Link to="/cart">
              View Cart →
            </Link>
          </div>
        )}

        {!recommendationsLoading &&
          renderRecommendationSection(
            "Makeup",
            "PERSONALIZED MAKEUP",
            recommendationGroups.makeup
          )}

        {!recommendationsLoading &&
          renderRecommendationSection(
            "Skincare",
            "PERSONALIZED SKINCARE",
            recommendationGroups.skincare
          )}

        {!recommendationsLoading &&
          renderRecommendationSection(
            "Haircare",
            "PERSONALIZED HAIRCARE",
            recommendationGroups.haircare
          )}

        {!recommendationsLoading &&
          renderRecommendationSection(
            "Clothing",
            "PERSONALIZED STYLE",
            recommendationGroups.clothing
          )}

        {!recommendationsLoading &&
          renderRecommendationSection(
            "Accessories",
            "PERSONALIZED DETAILS",
            recommendationGroups.accessories
          )}

        {!recommendationsLoading &&
          hasProfile &&
          !recommendationError && (
            <section className="products-section">
              <div className="products-empty">
                <h3>
                  Looking for something else?
                </h3>

                <p>
                  Explore the complete STYLAURA
                  collection and discover more
                  products.
                </p>

                <Link
                  to="/products"
                  className="primary-button"
                  style={{
                    display: "inline-flex",
                    marginTop: "16px",
                  }}
                >
                  Explore All Products →
                </Link>
              </div>
            </section>
          )}

        <div className="products-cart-bottom">
          <Link
            to="/cart"
            className="primary-button"
          >
            View Cart →
          </Link>
        </div>

      </main>
    );
  }

  /*
    NORMAL FULL CATALOGUE VIEW
  */

  return (
    <main className="products-page">

      {/* GAME RESULT BANNER */}

      {hasChallengeResult && (
        <section className="game-product-banner">
          <p className="eyebrow">
            STYLAURA • STYLE CHALLENGE
          </p>

          {passedChallenge ? (
            <>
              <h1>
                You passed.
                <br />
                <em>
                  Your collection is unlocked.
                </em>
              </h1>

              <p>
                Your styling instincts earned
                you access to STYLAURA and our
                partner brands.
              </p>

              {challenge.score !== null && (
                <span className="game-discount-badge">
                  SCORE {challenge.score}/100
                </span>
              )}
            </>
          ) : (
            <>
              <h1>
                Your STYLAURA
                <br />
                <em>
                  reward is waiting.
                </em>
              </h1>

              <p>
                You unlocked{" "}
                <strong>
                  {challengeDiscount}% off
                </strong>{" "}
                STYLAURA products.
              </p>

              <span className="game-discount-badge">
                {challengeDiscount}% OFF
              </span>
            </>
          )}
        </section>
      )}

      {/* NORMAL PRODUCTS HERO */}

      {!hasChallengeResult && (
        <section className="products-hero">
          <div>
            <p className="eyebrow">
              STYLAURA • PERSONALIZED BEAUTY
            </p>

            <h1>
              Your beauty
              <br />
              <em>collection.</em>
            </h1>

            <p>
              Explore products selected for
              your STYLAURA beauty journey.
            </p>
          </div>

          <Link
            to="/cart"
            className="products-profile-link"
          >
            View Cart →
          </Link>
        </section>
      )}

      {/* PROFILE + QUICK RECOMMENDATIONS */}

      {!recommendationsLoading &&
        hasProfile && (
          <section className="personalized-profile-banner">
            <div>
              <p className="eyebrow">
                STYLAURA • YOUR PROFILE
              </p>

              <h2>
                Recommendations made
                <br />
                <em>around you.</em>
              </h2>

              <p>
                Your personalized products are
                ready based on your saved profile.
              </p>
            </div>

            <div className="personalized-profile-tags">
              {profile.skinType && (
                <span>
                  Skin • {profile.skinType}
                </span>
              )}

              {profile.hairType && (
                <span>
                  Hair • {profile.hairType}
                </span>
              )}

              {profile.undertone && (
                <span>
                  Undertone •{" "}
                  {profile.undertone}
                </span>
              )}

              {profile.contrast && (
                <span>
                  Contrast •{" "}
                  {profile.contrast}
                </span>
              )}
            </div>

            <div style={{ marginTop: "18px" }}>
              <Link
                to="/products?view=recommended"
                className="secondary-button"
              >
                View My Recommendations →
              </Link>
            </div>
          </section>
        )}

      {recommendationError && (
        <div className="products-cart-message">
          <span>
            We couldn't load your personalized
            recommendations yet.
          </span>
        </div>
      )}

      {cartMessage && (
        <div className="products-cart-message">
          <span>
            {cartMessage}
          </span>

          <Link to="/cart">
            View Cart →
          </Link>
        </div>
      )}

      {/* STYLAURA PRODUCTS */}

      <section className="products-section">
        <div className="products-section-heading">
          <div>
            <p className="eyebrow">
              {failedChallenge
                ? "YOUR REWARD"
                : "STYLAURA EDIT"}
            </p>

            <h2>
              STYLAURA
              <br />
              <em>essentials.</em>
            </h2>
          </div>

          <span>
            {stylAuraProducts.length} products
          </span>
        </div>

        {failedChallenge && (
          <div className="discount-notice">
            <strong>
              {challengeDiscount}% OFF
            </strong>

            <span>
              Your Style Challenge reward
              applies to STYLAURA products.
            </span>
          </div>
        )}

        {stylAuraProducts.length === 0 ? (
          <div className="products-empty">
            <h3>
              Your STYLAURA collection is
              growing.
            </h3>

            <p>
              New personalized products will
              appear here soon.
            </p>
          </div>
        ) : (
          <div className="products-grid">
            {stylAuraProducts.map(
              (product) => {
                const discountedPrice =
                  failedChallenge
                    ? Number(
                        product.price || 0
                      ) *
                      (1 -
                        challengeDiscount /
                          100)
                    : Number(
                        product.price || 0
                      );

                return (
                  <article
                    key={product._id}
                    className="product-card"
                  >
                    <div className="product-image">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                        />
                      ) : (
                        <span>
                          STYLAURA
                        </span>
                      )}
                    </div>

                    <div className="product-card-content">
                      <p className="product-brand">
                        {product.brand}
                      </p>

                      <h3>
                        {product.name}
                      </h3>

                      <p className="product-category">
                        {product.category}
                        {product.subcategory
                          ? ` • ${product.subcategory}`
                          : ""}
                      </p>

                      {product.description && (
                        <p className="product-description">
                          {product.description}
                        </p>
                      )}

                      <div className="product-card-bottom">
                        <div className="product-price-area">
                          {failedChallenge && (
                            <span className="product-original-price">
                              ₹
                              {Number(
                                product.price ||
                                  0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          )}

                          <strong>
                            ₹
                            {discountedPrice.toLocaleString(
                              "en-IN",
                              {
                                maximumFractionDigits: 0,
                              }
                            )}
                          </strong>
                        </div>

                        <span
                          className={
                            product.stock > 0
                              ? "product-stock"
                              : "product-stock out"
                          }
                        >
                          {product.stock > 0
                            ? `${product.stock} available`
                            : "Out of stock"}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="product-add-button"
                        disabled={
                          product.stock <= 0 ||
                          addingProductId ===
                            product._id
                        }
                        onClick={() =>
                          addToCart(product)
                        }
                      >
                        {addingProductId ===
                        product._id
                          ? "Adding..."
                          : product.stock > 0
                          ? "Add to Cart"
                          : "Out of Stock"}
                      </button>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>

      {/* PARTNER BRAND PRODUCTS */}

      {passedChallenge && (
        <section className="products-section products-global-section">
          <div className="products-section-heading">
            <div>
              <p className="eyebrow">
                YOU PASSED
              </p>

              <h2>
                Partner brands.
                <br />
                <em>More to discover.</em>
              </h2>
            </div>

            <span>
              {visibleOtherProducts.length} products
            </span>
          </div>

          {visibleOtherProducts.length === 0 ? (
            <div className="products-empty">
              <h3>
                More brands are coming.
              </h3>

              <p>
                Partner-brand products will
                appear here when available.
              </p>
            </div>
          ) : (
            <div className="products-grid">
              {visibleOtherProducts.map(
                (product) => (
                  <article
                    key={product._id}
                    className="product-card"
                  >
                    <div className="product-image">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                        />
                      ) : (
                        <span>
                          {product.brand}
                        </span>
                      )}
                    </div>

                    <div className="product-card-content">
                      <p className="product-brand">
                        {product.brand}
                      </p>

                      <h3>
                        {product.name}
                      </h3>

                      <p className="product-category">
                        {product.category}
                        {product.subcategory
                          ? ` • ${product.subcategory}`
                          : ""}
                      </p>

                      {product.description && (
                        <p className="product-description">
                          {product.description}
                        </p>
                      )}

                      <div className="product-card-bottom">
                        <strong>
                          ₹
                          {Number(
                            product.price || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                        <span
                          className={
                            product.stock > 0
                              ? "product-stock"
                              : "product-stock out"
                          }
                        >
                          {product.stock > 0
                            ? `${product.stock} available`
                            : "Out of stock"}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="product-add-button"
                        disabled={
                          product.stock <= 0 ||
                          addingProductId ===
                            product._id
                        }
                        onClick={() =>
                          addToCart(product)
                        }
                      >
                        {addingProductId ===
                        product._id
                          ? "Adding..."
                          : product.stock > 0
                          ? "Add to Cart"
                          : "Out of Stock"}
                      </button>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>
      )}

      {/* FAILED CHALLENGE MESSAGE */}

      {failedChallenge && (
        <section className="game-product-footer">
          <p>
            Want access to more brands?
          </p>

          <Link
            to="/game"
            className="secondary-button"
          >
            Try the Style Challenge Again
          </Link>
        </section>
      )}

      {/* CART */}

      <div className="products-cart-bottom">
        <Link
          to="/cart"
          className="primary-button"
        >
          View Cart →
        </Link>
      </div>

    </main>
  );
}

export default Products;