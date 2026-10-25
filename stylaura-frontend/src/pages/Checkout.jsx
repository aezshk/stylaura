import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] =
    useState("card");

  const [cart, setCart] = useState(null);
  const [pricing, setPricing] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    if (user?.email) {
      setForm((current) => ({
        ...current,
        email:
          current.email || user.email,
      }));
    }

    if (user?.name) {
      const nameParts =
        user.name.trim().split(" ");

      setForm((current) => ({
        ...current,
        firstName:
          current.firstName ||
          nameParts[0] ||
          "",
        lastName:
          current.lastName ||
          nameParts.slice(1).join(" ") ||
          "",
      }));
    }
  }, [user]);

  const loadCart = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/cart",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load cart."
        );
      }

      setCart(data.cart);
      setPricing(data.pricing || null);
    } catch (error) {
      console.error(
        "Checkout cart error:",
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

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  const cartItems = cart?.items || [];

  /*
   * Pricing comes from the backend.
   * This keeps Checkout consistent with Cart
   * and prevents the frontend from deciding
   * the actual discount.
   */

  const subtotal = Number(
    pricing?.subtotal || 0
  );

  const discount = Number(
    pricing?.discount || 0
  );

  const discountPercent = Number(
    pricing?.discountPercent || 0
  );

  const discountedSubtotal = Number(
    pricing?.discountedSubtotal ??
      subtotal
  );

  const shipping =
    subtotal >= 2000 ? 0 : 99;

  const total =
    discountedSubtotal + shipping;

  const hasDiscount =
    discountPercent > 0 &&
    discount > 0;

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (cartItems.length === 0) {
      setError(
        "Your cart is empty. Please add a product before checkout."
      );
      return;
    }

    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.phone ||
      !form.address ||
      !form.city ||
      !form.state ||
      !form.pincode
    ) {
      setError(
        "Please complete all required delivery details."
      );
      return;
    }

    if (
      paymentMethod === "card" &&
      (!form.cardNumber ||
        !form.expiry ||
        !form.cvv)
    ) {
      setError(
        "Please complete your card details."
      );
      return;
    }

    try {
      setPlacingOrder(true);

      const response = await fetch(
        "http://localhost:5000/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            delivery: {
              firstName:
                form.firstName,
              lastName:
                form.lastName,
              email: form.email,
              phone: form.phone,
              address: form.address,
              city: form.city,
              state: form.state,
              pincode: form.pincode,
            },

            paymentMethod,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to place order."
        );
      }

      navigate("/order-success");
    } catch (error) {
      console.error(
        "Place order error:",
        error
      );

      setError(
        error.message ||
          "Unable to place your order."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <main className="checkout-page">
        <section className="checkout-hero">
          <div>
            <p className="eyebrow">
              STYLAURA • CHECKOUT
            </p>

            <h1>
              Preparing your
              <br />
              <em>beauty edit.</em>
            </h1>

            <p>
              Loading the products in your
              STYLAURA cart.
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (!cart || cartItems.length === 0) {
    return (
      <main className="checkout-page">
        <section className="checkout-hero">
          <div>
            <p className="eyebrow">
              STYLAURA • CHECKOUT
            </p>

            <h1>
              Your beauty edit
              <br />
              is <em>empty.</em>
            </h1>

            <p>
              Add something to your cart before
              continuing to checkout.
            </p>

            <Link
              to="/products"
              className="primary-button"
            >
              Explore Products
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <section className="checkout-hero">
        <div>
          <p className="eyebrow">
            STYLAURA • CHECKOUT
          </p>

          <h1>
            Complete your
            <br />
            <em>beauty edit.</em>
          </h1>

          <p>
            A few final details and your
            personalized collection will be
            ready to come home to you.
          </p>
        </div>

        <div className="checkout-step-mark">
          <span>03</span>

          <small>OF 03</small>
        </div>
      </section>

      <section className="checkout-content">
        <form
          className="checkout-form"
          onSubmit={handleSubmit}
        >
          <section className="checkout-block">
            <div className="checkout-block-heading">
              <span className="checkout-number">
                01
              </span>

              <div>
                <p className="eyebrow">
                  DELIVERY
                </p>

                <h2>
                  Where should we
                  <br />
                  send your <em>edit?</em>
                </h2>
              </div>
            </div>

            <div className="checkout-fields">
              <div className="checkout-field">
                <label htmlFor="firstName">
                  First Name *
                </label>

                <input
                  id="firstName"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Your first name"
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="lastName">
                  Last Name *
                </label>

                <input
                  id="lastName"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Your last name"
                />
              </div>

              <div className="checkout-field checkout-full">
                <label htmlFor="email">
                  Email Address *
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                />
              </div>

              <div className="checkout-field checkout-full">
                <label htmlFor="phone">
                  Phone Number *
                </label>

                <input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91"
                />
              </div>

              <div className="checkout-field checkout-full">
                <label htmlFor="address">
                  Address *
                </label>

                <input
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="House number, street, area"
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="city">
                  City *
                </label>

                <input
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="state">
                  State *
                </label>

                <input
                  id="state"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="State"
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="pincode">
                  PIN Code *
                </label>

                <input
                  id="pincode"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="000000"
                />
              </div>
            </div>
          </section>

          <section className="checkout-block">
            <div className="checkout-block-heading">
              <span className="checkout-number">
                02
              </span>

              <div>
                <p className="eyebrow">
                  PAYMENT
                </p>

                <h2>
                  Choose how you'd
                  <br />
                  like to <em>pay.</em>
                </h2>
              </div>
            </div>

            <div className="payment-options">
              <button
                type="button"
                className={
                  paymentMethod === "card"
                    ? "payment-option active"
                    : "payment-option"
                }
                onClick={() =>
                  setPaymentMethod("card")
                }
              >
                <span className="payment-radio">
                  {paymentMethod ===
                    "card" && "✓"}
                </span>

                <span>
                  Card Payment
                </span>
              </button>

              <button
                type="button"
                className={
                  paymentMethod === "cod"
                    ? "payment-option active"
                    : "payment-option"
                }
                onClick={() =>
                  setPaymentMethod("cod")
                }
              >
                <span className="payment-radio">
                  {paymentMethod ===
                    "cod" && "✓"}
                </span>

                <span>
                  Cash on Delivery
                </span>
              </button>
            </div>

            {paymentMethod === "card" && (
              <div className="card-fields">
                <div className="checkout-field checkout-full">
                  <label htmlFor="cardNumber">
                    Card Number *
                  </label>

                  <input
                    id="cardNumber"
                    name="cardNumber"
                    value={form.cardNumber}
                    onChange={handleChange}
                    placeholder="1234 5678 9012 3456"
                    inputMode="numeric"
                  />
                </div>

                <div className="checkout-field">
                  <label htmlFor="expiry">
                    Expiry *
                  </label>

                  <input
                    id="expiry"
                    name="expiry"
                    value={form.expiry}
                    onChange={handleChange}
                    placeholder="MM / YY"
                  />
                </div>

                <div className="checkout-field">
                  <label htmlFor="cvv">
                    CVV *
                  </label>

                  <input
                    id="cvv"
                    name="cvv"
                    value={form.cvv}
                    onChange={handleChange}
                    placeholder="•••"
                    type="password"
                    inputMode="numeric"
                  />
                </div>
              </div>
            )}
          </section>

          {error && (
            <div className="checkout-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="place-order-button"
            disabled={placingOrder}
          >
            {placingOrder
              ? "Placing Order..."
              : "Place Order"}

            <span>→</span>
          </button>

          <Link
            to="/cart"
            className="back-to-cart"
          >
            ← Back to Cart
          </Link>
        </form>

        <aside className="checkout-summary">
          <div className="checkout-summary-top">
            <p className="eyebrow">
              YOUR ORDER
            </p>

            <h2>
              The beauty
              <br />
              <em>edit.</em>
            </h2>
          </div>

          <div className="checkout-products">
            {cartItems.map((item) => {
              const product =
                item.product;

              return (
                <div
                  className="checkout-product"
                  key={product._id}
                >
                  <div className="checkout-product-image soft">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                      />
                    ) : (
                      <div className="mini-bottle">
                        <div />
                        <span>S</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <p>
                      {product.category}
                    </p>

                    <h3>
                      {product.name}
                    </h3>

                    <span>
                      Qty {item.quantity}
                    </span>
                  </div>

                  <strong>
                    ₹
                    {(
                      product.price *
                      item.quantity
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>
              );
            })}
          </div>

          <div className="checkout-total-lines">
            <div>
              <span>
                Subtotal
              </span>

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
              <div>
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
            )}

            {hasDiscount && (
              <div className="checkout-discount-note">
                <span>
                  {discountPercent}% OFF
                </span>

                <strong>
                  STYLAURA products
                </strong>
              </div>
            )}

            <div>
              <span>
                Shipping
              </span>

              <strong>
                {shipping === 0
                  ? "Free"
                  : `₹${shipping}`}
              </strong>
            </div>
          </div>

          <div className="checkout-grand-total">
            <span>
              Total
            </span>

            <strong>
              ₹
              {total.toLocaleString(
                "en-IN",
                {
                  maximumFractionDigits: 0,
                }
              )}
            </strong>
          </div>

          <div className="checkout-note">
            <span>✦</span>

            <p>
              Your products have been selected
              as part of your STYLAURA beauty
              edit.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default Checkout;