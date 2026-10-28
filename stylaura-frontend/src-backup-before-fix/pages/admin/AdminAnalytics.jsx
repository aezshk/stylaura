import API_BASE_URL from "../../api;
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function AdminAnalytics() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const [ordersResponse, usersResponse, productsResponse] =
        await Promise.all([
          fetch(
            "${API_BASE_URL}/api/orders/admin",
            {
              credentials: "include",
            }
          ),

          fetch(
            "${API_BASE_URL}/api/admin/users",
            {
              credentials: "include",
            }
          ),

          fetch(
            "${API_BASE_URL}/api/products/admin",
            {
              credentials: "include",
            }
          ),
        ]);

      const ordersData =
        await ordersResponse.json();

      const usersData =
        await usersResponse.json();

      const productsData =
        await productsResponse.json();

      if (!ordersResponse.ok) {
        throw new Error(
          ordersData.message ||
            "Unable to load orders."
        );
      }

      if (!usersResponse.ok) {
        throw new Error(
          usersData.message ||
            "Unable to load users."
        );
      }

      if (!productsResponse.ok) {
        throw new Error(
          productsData.message ||
            "Unable to load products."
        );
      }

      setOrders(
        ordersData.orders || []
      );

      setUsers(
        usersData.users || []
      );

      setProducts(
        productsData.products || []
      );
    } catch (error) {
      console.error(
        "Analytics error:",
        error
      );

      setError(
        error.message ||
          "Unable to load analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = orders.reduce(
    (sum, order) =>
      sum + Number(order.total || 0),
    0
  );

  const productsSold = orders.reduce(
    (sum, order) =>
      sum +
      (order.items || []).reduce(
        (itemTotal, item) =>
          itemTotal +
          Number(item.quantity || 0),
        0
      ),
    0
  );

  const placedOrders = orders.filter(
    (order) =>
      order.status === "placed"
  ).length;

  const processingOrders = orders.filter(
    (order) =>
      order.status === "processing"
  ).length;

  const shippedOrders = orders.filter(
    (order) =>
      order.status === "shipped"
  ).length;

  const deliveredOrders = orders.filter(
    (order) =>
      order.status === "delivered"
  ).length;

  const cancelledOrders = orders.filter(
    (order) =>
      order.status === "cancelled"
  ).length;

  if (loading) {
    return (
      <main className="admin-page">
        <section className="admin-analytics-page">
          <p className="eyebrow">
            STYLAURA • ANALYTICS
          </p>

          <h1>
            Platform
            <br />
            <em>insights.</em>
          </h1>

          <p>
            Loading platform analytics...
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <section className="admin-analytics-page">

        <div className="admin-analytics-header">
          <div>
            <p className="eyebrow">
              STYLAURA • ANALYTICS
            </p>

            <h1>
              Platform
              <br />
              <em>insights.</em>
            </h1>

            <p>
              A live overview of customers,
              products, orders and platform
              performance.
            </p>
          </div>

          <Link
            to="/admin"
            className="secondary-button"
          >
            ← Dashboard
          </Link>
        </div>


        {error && (
          <div className="admin-analytics-error">
            {error}
          </div>
        )}


        {/* =================================================
            KEY METRICS
        ================================================= */}

        <section className="analytics-metrics">

          <article className="analytics-metric-card">
            <span>
              CUSTOMERS
            </span>

            <strong>
              {users.length}
            </strong>

            <p>
              Registered accounts
            </p>
          </article>


          <article className="analytics-metric-card">
            <span>
              ORDERS
            </span>

            <strong>
              {orders.length}
            </strong>

            <p>
              Total customer orders
            </p>
          </article>


          <article className="analytics-metric-card">
            <span>
              REVENUE
            </span>

            <strong>
              ₹
              {totalRevenue.toLocaleString(
                "en-IN"
              )}
            </strong>

            <p>
              Gross order value
            </p>
          </article>


          <article className="analytics-metric-card">
            <span>
              PRODUCTS SOLD
            </span>

            <strong>
              {productsSold}
            </strong>

            <p>
              Units across all orders
            </p>
          </article>

        </section>


        {/* =================================================
            ORDER STATUS
        ================================================= */}

        <section className="analytics-section">

          <div className="analytics-section-heading">
            <div>
              <p className="eyebrow">
                ORDER STATUS
              </p>

              <h2>
                Fulfillment
                <br />
                <em>overview.</em>
              </h2>
            </div>

            <span>
              {orders.length} total orders
            </span>
          </div>


          <div className="analytics-status-grid">

            <div className="analytics-status-item">
              <span>
                Placed
              </span>

              <strong>
                {placedOrders}
              </strong>
            </div>


            <div className="analytics-status-item">
              <span>
                Processing
              </span>

              <strong>
                {processingOrders}
              </strong>
            </div>


            <div className="analytics-status-item">
              <span>
                Shipped
              </span>

              <strong>
                {shippedOrders}
              </strong>
            </div>


            <div className="analytics-status-item">
              <span>
                Delivered
              </span>

              <strong>
                {deliveredOrders}
              </strong>
            </div>


            <div className="analytics-status-item">
              <span>
                Cancelled
              </span>

              <strong>
                {cancelledOrders}
              </strong>
            </div>

          </div>

        </section>


        {/* =================================================
            INVENTORY
        ================================================= */}

        <section className="analytics-section">

          <div className="analytics-section-heading">
            <div>
              <p className="eyebrow">
                INVENTORY
              </p>

              <h2>
                Product
                <br />
                <em>overview.</em>
              </h2>
            </div>

            <span>
              {products.length} products
            </span>
          </div>


          <div className="analytics-inventory">

            <div>
              <span>
                Active products
              </span>

              <strong>
                {
                  products.filter(
                    (product) =>
                      product.isActive
                  ).length
                }
              </strong>
            </div>


            <div>
              <span>
                Out of stock
              </span>

              <strong>
                {
                  products.filter(
                    (product) =>
                      Number(
                        product.stock || 0
                      ) === 0
                  ).length
                }
              </strong>
            </div>


            <div>
              <span>
                STYLAURA products
              </span>

              <strong>
                {
                  products.filter(
                    (product) =>
                      product.isStylaura
                  ).length
                }
              </strong>
            </div>

          </div>

        </section>


        {/* =================================================
            RECENT ORDERS
        ================================================= */}

        <section className="analytics-section">

          <div className="analytics-section-heading">
            <div>
              <p className="eyebrow">
                RECENT ACTIVITY
              </p>

              <h2>
                Latest
                <br />
                <em>orders.</em>
              </h2>
            </div>

            <Link
              to="/admin/orders"
              className="analytics-view-link"
            >
              View all →
            </Link>
          </div>


          {orders.length === 0 ? (
            <div className="analytics-no-orders">
              No orders have been placed yet.
            </div>
          ) : (
            <div className="analytics-recent-orders">

              {orders
                .slice(0, 5)
                .map((order) => {

                  const orderNumber =
                    order._id
                      ? `#STY-${order._id
                          .slice(-6)
                          .toUpperCase()}`
                      : "#STYLAURA";

                  const customerName =
                    order.user?.name ||
                    `${order.delivery?.firstName || ""} ${
                      order.delivery?.lastName || ""
                    }`.trim() ||
                    "Customer";

                  const orderDate =
                    order.createdAt
                      ? new Date(
                          order.createdAt
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "—";

                  return (
                    <div
                      className="analytics-recent-order"
                      key={order._id}
                    >

                      <div>
                        <span>
                          {orderNumber}
                        </span>

                        <strong>
                          {customerName}
                        </strong>

                        <small>
                          {orderDate}
                        </small>
                      </div>


                      <div>
                        <span>
                          {order.status}
                        </span>

                        <strong>
                          ₹
                          {Number(
                            order.total || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </div>

                    </div>
                  );
                })}

            </div>
          )}

        </section>

      </section>
    </main>
  );
}

export default AdminAnalytics;