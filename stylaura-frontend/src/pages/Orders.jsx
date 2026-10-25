import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
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
          data.message || "Unable to load orders."
        );
      }

      setOrders(data.orders || []);
    } catch (error) {
      console.error(
        "Order history error:",
        error
      );

      setError(
        error.message ||
          "Unable to load your orders."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="orders-page">
        <section className="orders-header">
          <p className="eyebrow">
            STYLAURA • ORDER HISTORY
          </p>

          <h1>
            Your beauty
            <br />
            <em>journey.</em>
          </h1>

          <p>
            Loading your previous STYLAURA
            orders.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="orders-page">
      <section className="orders-header">
        <p className="eyebrow">
          STYLAURA • ORDER HISTORY
        </p>

        <h1>
          Your beauty
          <br />
          <em>journey.</em>
        </h1>

        <p>
          View your previous STYLAURA orders,
          products and order totals.
        </p>
      </section>

      <section className="orders-content">
        {error && (
          <div className="orders-error">
            {error}
          </div>
        )}

        {!error && orders.length === 0 && (
          <div className="orders-empty">
            <p className="eyebrow">
              NO ORDERS YET
            </p>

            <h2>
              Your next beauty
              <br />
              <em>edit awaits.</em>
            </h2>

            <p>
              Explore the STYLAURA collection
              and create your first order.
            </p>

            <Link
              to="/products"
              className="primary-button"
            >
              Explore Products →
            </Link>
          </div>
        )}

        {orders.map((order) => {
          const orderNumber = order._id
            ? `#STY-${order._id
                .slice(-6)
                .toUpperCase()}`
            : "#STYLAURA";

          const orderDate = new Date(
            order.createdAt
          ).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });

          return (
            <article
              className="order-history-card"
              key={order._id}
            >
              <div className="order-history-top">
                <div>
                  <p className="eyebrow">
                    ORDER
                  </p>

                  <h2>
                    {orderNumber}
                  </h2>

                  <span>
                    {orderDate}
                  </span>
                </div>

                <div className="order-history-status">
                  <span>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="order-history-products">
                {order.items.map((item) => (
                  <div
                    className="order-history-product"
                    key={item.product}
                  >
                    <div className="order-history-image">
                      <span>S</span>
                    </div>

                    <div>
                      <p>
                        {item.brand ||
                          "STYLAURA"}
                      </p>

                      <h3>
                        {item.name}
                      </h3>

                      <span>
                        Qty {item.quantity}
                      </span>
                    </div>

                    <strong>
                      ₹
                      {(
                        item.price *
                        item.quantity
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="order-history-bottom">
                <div>
                  <span>Payment</span>

                  <strong>
                    {order.paymentMethod ===
                    "cod"
                      ? "Cash on Delivery"
                      : "Card Payment"}
                  </strong>
                </div>

                <div>
                  <span>Total</span>

                  <strong>
                    ₹
                    {Number(
                      order.total
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

export default Orders;