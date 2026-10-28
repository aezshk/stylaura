import API_BASE_URL from "../../api;
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] =
    useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "${API_BASE_URL}/api/orders/admin",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load customer orders."
        );
      }

      setOrders(data.orders || []);
    } catch (error) {
      console.error(
        "Admin orders error:",
        error
      );

      setError(
        error.message ||
          "Unable to load customer orders."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (
    orderId,
    status
  ) => {
    try {
      setUpdatingOrderId(orderId);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/orders/admin/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update order status."
        );
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                status: data.order.status,
              }
            : order
        )
      );
    } catch (error) {
      console.error(
        "Update order status error:",
        error
      );

      setError(
        error.message ||
          "Unable to update order status."
      );
    } finally {
      setUpdatingOrderId("");
    }
  };

  if (loading) {
    return (
      <main className="admin-page">
        <section className="admin-orders-page">
          <p className="eyebrow">
            STYLAURA • ORDERS
          </p>

          <h1>
            Customer
            <br />
            <em>orders.</em>
          </h1>

          <p>
            Loading customer orders...
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <section className="admin-orders-page">
        <div className="admin-orders-header">
          <div>
            <p className="eyebrow">
              STYLAURA • ORDERS
            </p>

            <h1>
              Customer
              <br />
              <em>orders.</em>
            </h1>

            <p>
              Review customer orders and
              manage fulfillment status.
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
          <div className="admin-orders-error">
            {error}
          </div>
        )}

        {!error && orders.length === 0 && (
          <div className="admin-orders-empty">
            <p className="eyebrow">
              NO ORDERS
            </p>

            <h2>
              No customer
              <br />
              <em>orders yet.</em>
            </h2>

            <p>
              Customer orders will appear here
              after checkout is completed.
            </p>
          </div>
        )}

        {!error && orders.length > 0 && (
          <div className="admin-orders-list">
            {orders.map((order) => {
              const orderNumber = order._id
                ? `#STY-${order._id
                    .slice(-6)
                    .toUpperCase()}`
                : "#STYLAURA";

              const orderDate = order.createdAt
                ? new Date(
                    order.createdAt
                  ).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )
                : "—";

              const customerName =
                order.user?.name ||
                `${order.delivery?.firstName || ""} ${
                  order.delivery?.lastName || ""
                }`.trim() ||
                "Customer";

              const customerEmail =
                order.user?.email ||
                order.delivery?.email ||
                "—";

              return (
                <article
                  className="admin-order-card"
                  key={order._id}
                >
                  <div className="admin-order-top">
                    <div>
                      <p className="eyebrow">
                        {orderNumber}
                      </p>

                      <h2>
                        {customerName}
                      </h2>

                      <span>
                        {customerEmail}
                      </span>

                      <small>
                        {orderDate}
                      </small>
                    </div>

                    <div className="admin-order-status">
                      <label>
                        STATUS
                      </label>

                      <select
                        value={
                          order.status
                        }
                        disabled={
                          updatingOrderId ===
                          order._id
                        }
                        onChange={(event) =>
                          updateOrderStatus(
                            order._id,
                            event.target.value
                          )
                        }
                      >
                        <option value="placed">
                          Placed
                        </option>

                        <option value="processing">
                          Processing
                        </option>

                        <option value="shipped">
                          Shipped
                        </option>

                        <option value="delivered">
                          Delivered
                        </option>

                        <option value="cancelled">
                          Cancelled
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="admin-order-products">
                    {order.items?.map(
                      (item, index) => (
                        <div
                          className="admin-order-product"
                          key={
                            item.product?._id ||
                            `${order._id}-${index}`
                          }
                        >
                          <div className="admin-order-product-image">
                            <span>
                              S
                            </span>
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
                              Qty{" "}
                              {item.quantity}
                            </span>
                          </div>

                          <strong>
                            ₹
                            {(
                              item.price *
                              item.quantity
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </strong>
                        </div>
                      )
                    )}
                  </div>

                  <div className="admin-order-details">
                    <div>
                      <span>
                        Payment
                      </span>

                      <strong>
                        {order.paymentMethod ===
                        "cod"
                          ? "Cash on Delivery"
                          : "Card Payment"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Delivery
                      </span>

                      <strong>
                        {order.delivery?.city ||
                          "—"}
                        ,{" "}
                        {order.delivery?.state ||
                          "—"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Total
                      </span>

                      <strong>
                        ₹
                        {Number(
                          order.total
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="admin-order-address">
                    <span>
                      Delivery address
                    </span>

                    <p>
                      {order.delivery?.address}
                      <br />
                      {order.delivery?.city},{" "}
                      {order.delivery?.state}{" "}
                      -{" "}
                      {order.delivery?.pincode}
                    </p>

                    <p>
                      Phone:{" "}
                      {order.delivery?.phone ||
                        "—"}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminOrders;