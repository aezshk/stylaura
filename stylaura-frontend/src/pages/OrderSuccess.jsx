import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function OrderSuccess() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadLatestOrder();
  }, []);

  const loadLatestOrder = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/orders",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load your order."
        );
      }

      if (!data.orders || data.orders.length === 0) {
        setError("No recent order was found.");
        return;
      }

      setOrder(data.orders[0]);
    } catch (error) {
      console.error(
        "Order success error:",
        error
      );

      setError(
        error.message ||
          "Unable to load your order."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="order-success-page">
        <section className="order-success-hero">
          <p className="eyebrow">
            STYLAURA • ORDER CONFIRMED
          </p>

          <h1>
            Preparing your
            <br />
            <em>order details.</em>
          </h1>

          <p className="success-intro">
            We're loading your latest STYLAURA
            order.
          </p>
        </section>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="order-success-page">
        <section className="order-success-hero">
          <p className="eyebrow">
            STYLAURA • ORDER
          </p>

          <h1>
            We couldn't find
            <br />
            your <em>order.</em>
          </h1>

          <p className="success-intro">
            {error ||
              "Your order details are not available right now."}
          </p>

          <div className="success-actions">
            <Link
              to="/dashboard"
              className="primary-button"
            >
              Go to My Dashboard →
            </Link>

            <Link
              to="/products"
              className="secondary-button"
            >
              Explore Products
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const orderNumber =
    order._id
      ? `#STY-${order._id
          .slice(-6)
          .toUpperCase()}`
      : "#STYLAURA";

  return (
    <main className="order-success-page">
      <section className="order-success-hero">
        <div className="success-symbol">
          <span>✓</span>
        </div>

        <p className="eyebrow">
          STYLAURA • ORDER CONFIRMED
        </p>

        <h1>
          Your beauty
          <br />
          <em>edit is on its way.</em>
        </h1>

        <p className="success-intro">
          Thank you for choosing STYLAURA.
          Your personalized beauty collection
          has been successfully placed.
        </p>

        <div className="order-number">
          <span>ORDER NUMBER</span>

          <strong>
            {orderNumber}
          </strong>
        </div>
      </section>

      <section className="order-success-details">
        <div className="success-details-grid">

          {/* DELIVERY */}

          <div className="success-info-card">
            <span className="success-card-number">
              01
            </span>

            <p className="eyebrow">
              DELIVERY
            </p>

            <h2>
              On its way
              <br />
              <em>to you.</em>
            </h2>

            <p>
              Your order will be prepared and
              dispatched to the delivery address
              provided during checkout.
            </p>

            {order.delivery && (
              <p className="success-delivery-details">
                {order.delivery.firstName}{" "}
                {order.delivery.lastName}
                <br />
                {order.delivery.address}
                <br />
                {order.delivery.city},{" "}
                {order.delivery.state}
                <br />
                {order.delivery.pincode}
              </p>
            )}
          </div>


          {/* YOUR EDIT */}

          <div className="success-info-card">
            <span className="success-card-number">
              02
            </span>

            <p className="eyebrow">
              YOUR EDIT
            </p>

            <h2>
              Curated
              <br />
              <em>for you.</em>
            </h2>

            <div className="success-products">
              {order.items.map((item) => (
                <div
                  className="success-product"
                  key={item.product}
                >
                  <div className="success-product-visual soft">
                    {item.product?.image ? (
                      <img
                        src={item.product.image}
                        alt={item.name}
                      />
                    ) : (
                      <div className="success-mini-bottle">
                        <span>S</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <span>
                      {item.brand ||
                        "STYLAURA"}
                    </span>

                    <h3>
                      {item.name}
                    </h3>

                    <small>
                      Qty {item.quantity}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* TOTAL */}

          <div className="success-info-card success-total-card">
            <span className="success-card-number">
              03
            </span>

            <p className="eyebrow">
              ORDER TOTAL
            </p>

            <h2>
              ₹
              {Number(
                order.total
              ).toLocaleString("en-IN")}
            </h2>

            <p>
              {order.paymentMethod === "cod"
                ? "Cash on delivery selected. Your beauty collection is now part of your STYLAURA journey."
                : "Payment confirmed. Your beauty collection is now part of your STYLAURA journey."}
            </p>

            <div className="success-status">
              <span>✓</span>

              <strong>
                Order confirmed
              </strong>
            </div>
          </div>
        </div>


        {/* NEXT STEP */}

        <div className="success-next">
          <p className="eyebrow">
            KEEP EXPLORING
          </p>

          <h2>
            Beauty doesn't
            <br />
            stop <em>here.</em>
          </h2>

          <p>
            Continue discovering your skin,
            hair and colour profile to make
            your STYLAURA experience even more
            personalized.
          </p>

          <div className="success-actions">
            <Link
              to="/dashboard"
              className="primary-button"
            >
              Go to My Dashboard →
            </Link>

            <Link
              to="/products"
              className="secondary-button"
            >
              Explore Products
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default OrderSuccess;