import API_BASE_URL from ../api;
import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

const CART_URL = "${API_BASE_URL}/api/cart";

function Cart() {
  const [cart, setCart] = useState(null);
  const [pricing, setPricing] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] =
    useState(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(CART_URL, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load your cart."
        );
      }

      setCart(data.cart);
      setPricing(data.pricing || null);
    } catch (error) {
      console.error(
        "Load cart error:",
        error
      );

      setError(
        error.message ||
          "Unable to load your cart."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (
    productId,
    quantity
  ) => {
    try {
      setUpdatingId(productId);
      setError("");

      const response = await fetch(
        `${CART_URL}/items/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            quantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update cart."
        );
      }

      setCart(data.cart);
      setPricing(data.pricing || null);
    } catch (error) {
      console.error(
        "Update cart error:",
        error
      );

      setError(
        error.message ||
          "Unable to update cart."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (productId) => {
    try {
      setUpdatingId(productId);
      setError("");

      const response = await fetch(
        `${CART_URL}/items/${productId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to remove product."
        );
      }

      setCart(data.cart);
      setPricing(data.pricing || null);
    } catch (error) {
      console.error(
        "Remove cart item error:",
        error
      );

      setError(
        error.message ||
          "Unable to remove product."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const clearCart = async () => {
    try {
      setError("");

      const response = await fetch(
        CART_URL,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to clear cart."
        );
      }

      setCart(data.cart);
      setPricing(null);
    } catch (error) {
      console.error(
        "Clear cart error:",
        error
      );

      setError(
        error.message ||
          "Unable to clear cart."
      );
    }
  };

  if (loading) {
    return (
      <main className="cart-page">
        <section className="cart-loading">
          <p className="eyebrow">
            STYLAURA • CART
          </p>

          <h1>
            Loading your
            <br />
            <em>cart.</em>
          </h1>
        </section>
      </main>
    );
  }

  if (error && !cart) {
    return (
      <main className="cart-page">
        <section className="cart-error">
          <p className="eyebrow">
            STYLAURA • CART
          </p>

          <h1>
            We couldn't load
            <br />
            <em>your cart.</em>
          </h1>

          <p>{error}</p>

          <button
            type="button"
            className="primary-button"
            onClick={loadCart}
          >
            Try Again
          </button>
        </section>
      </main>
    );
  }

  const items = cart?.items || [];

  const subtotal =
    Number(pricing?.subtotal || 0);

  const discount =
    Number(pricing?.discount || 0);

  const discountPercent =
    Number(
      pricing?.discountPercent || 0
    );

  const discountedSubtotal =
    Number(
      pricing?.discountedSubtotal ??
        subtotal
    );

  const hasDiscount =
    discountPercent > 0 &&
    discount > 0;

  return (
    <main className="cart-page">
      <section className="cart-header">
        <div>
          <p className="eyebrow">
            STYLAURA • YOUR COLLECTION
          </p>

          <h1>
            Your
            <br />
            <em>cart.</em>
          </h1>

          <p>
            Review the products you've
            selected before continuing.
          </p>
        </div>

        <Link
          to="/products"
          className="cart-continue-link"
        >
          ← Continue Shopping
        </Link>
      </section>

      {error && (
        <div className="cart-message">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <section className="cart-empty">
          <p className="eyebrow">
            YOUR CART
          </p>

          <h2>
            Nothing here
            <br />
            <em>yet.</em>
          </h2>

          <p>
            Explore your STYLAURA collection
            and add something you love.
          </p>

          <Link
            to="/products"
            className="primary-button"
          >
            Explore Products
          </Link>
        </section>
      ) : (
        <section className="cart-layout">
          <div className="cart-items">
            <div className="cart-items-heading">
              <span>
                {items.length}{" "}
                {items.length === 1
                  ? "item"
                  : "items"}
              </span>

              <button
                type="button"
                onClick={clearCart}
              >
                Clear Cart
              </button>
            </div>

            {items.map((item) => {
              const product =
                item.product;

              if (!product) return null;

              const itemTotal =
                Number(
                  product.price || 0
                ) * item.quantity;

              return (
                <article
                  key={product._id}
                  className="cart-item"
                >
                  <div className="cart-item-image">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                      />
                    ) : (
                      <span>
                        {product.brand ||
                          "STYLAURA"}
                      </span>
                    )}
                  </div>

                  <div className="cart-item-info">
                    <p className="cart-item-brand">
                      {product.brand}
                    </p>

                    <h2>
                      {product.name}
                    </h2>

                    <p>
                      {product.category}
                    </p>

                    <strong>
                      ₹
                      {Number(
                        product.price || 0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                  <div className="cart-item-controls">
                    <div className="cart-quantity">
                      <button
                        type="button"
                        disabled={
                          updatingId ===
                            product._id ||
                          item.quantity <= 1
                        }
                        onClick={() =>
                          updateQuantity(
                            product._id,
                            item.quantity - 1
                          )
                        }
                      >
                        −
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        disabled={
                          updatingId ===
                            product._id ||
                          item.quantity >=
                            product.stock
                        }
                        onClick={() =>
                          updateQuantity(
                            product._id,
                            item.quantity + 1
                          )
                        }
                      >
                        +
                      </button>
                    </div>

                    <strong>
                      ₹
                      {itemTotal.toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                    <button
                      type="button"
                      className="cart-remove"
                      disabled={
                        updatingId ===
                        product._id
                      }
                      onClick={() =>
                        removeItem(
                          product._id
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="cart-summary">
            <p className="eyebrow">
              ORDER SUMMARY
            </p>

            <h2>
              Your
              <br />
              <em>total.</em>
            </h2>

            <div className="cart-summary-line">
              <span>Subtotal</span>

              <strong>
                ₹
                {subtotal.toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits: 0,
                  }
                )}
              </strong>
            </div>

            {hasDiscount && (
              <>
                <div className="cart-summary-line">
                  <span>
                    Style Challenge
                  </span>

                  <strong>
                    -₹
                    {discount.toLocaleString(
                      "en-IN",
                      {
                        maximumFractionDigits: 0,
                      }
                    )}
                  </strong>
                </div>

                <div className="cart-discount-note">
                  {discountPercent}% OFF STYLAURA
                  products
                </div>
              </>
            )}

            <div className="cart-summary-line">
              <span>Delivery</span>

              <strong>
                Calculated at checkout
              </strong>
            </div>

            <div className="cart-summary-total">
              <span>
                Total
              </span>

              <strong>
                ₹
                {discountedSubtotal.toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits: 0,
                  }
                )}
              </strong>
            </div>

            <Link
              to="/checkout"
              className="cart-checkout-button"
            >
              Continue to Checkout
            </Link>
          </aside>
        </section>
      )}
    </main>
  );
}

export default Cart;