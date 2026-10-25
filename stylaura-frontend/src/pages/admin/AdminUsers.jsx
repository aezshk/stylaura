import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AdminUsers() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user || user.role !== "admin") {
      navigate("/admin/login", {
        replace: true,
      });
      return;
    }

    const loadUsers = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/admin/users`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load users."
          );
        }

        setUsers(data.users || []);
      } catch (error) {
        console.error("Admin users error:", error);

        setError(
          error.message || "Unable to load users."
        );
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <main className="admin-page">
        <section className="admin-loading">
          <p className="eyebrow">
            STYLAURA • USERS
          </p>

          <h1>
            Loading
            <br />
            <em>customers.</em>
          </h1>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="admin-page">
        <section className="admin-error-card">
          <p className="eyebrow">
            STYLAURA • USERS
          </p>

          <h1>
            Unable to load
            <br />
            <em>customers.</em>
          </h1>

          <p>{error}</p>

          <button
            type="button"
            className="primary-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">

      <section className="admin-users-header">

        <div>
          <p className="eyebrow">
            STYLAURA • CUSTOMER MANAGEMENT
          </p>

          <h1>
            Customer
            <br />
            <em>accounts.</em>
          </h1>

          <p>
            View the customers who have joined
            the STYLAURA beauty experience.
          </p>
        </div>

        <Link
          to="/admin"
          className="admin-back-link"
        >
          ← Admin Dashboard
        </Link>

      </section>


      <section className="admin-users-summary">

        <div>
          <span>01</span>

          <p>TOTAL CUSTOMERS</p>

          <strong>
            {users.length}
          </strong>
        </div>

        <div>
          <span>02</span>

          <p>SKIN PROFILES</p>

          <strong>
            {
              users.filter(
                (item) => item.skinProfile
              ).length
            }
          </strong>
        </div>

        <div>
          <span>03</span>

          <p>HAIR PROFILES</p>

          <strong>
            {
              users.filter(
                (item) => item.hairProfile
              ).length
            }
          </strong>
        </div>

        <div>
          <span>04</span>

          <p>COLOUR PROFILES</p>

          <strong>
            {
              users.filter(
                (item) => item.colourProfile
              ).length
            }
          </strong>
        </div>

      </section>


      <section className="admin-users-section">

        <div className="admin-users-section-heading">

          <div>
            <p className="eyebrow">
              REGISTERED USERS
            </p>

            <h2>
              Your
              <br />
              <em>customers.</em>
            </h2>
          </div>

          <span>
            {users.length} accounts
          </span>

        </div>


        {users.length === 0 ? (
          <div className="admin-empty">
            <h3>
              No customers yet.
            </h3>

            <p>
              Registered customer accounts
              will appear here.
            </p>
          </div>
        ) : (
          <div className="admin-users-table">

            <div className="admin-users-table-head">
              <span>Customer</span>
              <span>Joined</span>
              <span>Skin</span>
              <span>Hair</span>
              <span>Colour</span>
            </div>

            {users.map((customer) => (
              <article
                key={customer._id}
                className="admin-user-row"
              >

                <div className="admin-user-name">
                  <strong>
                    {customer.name}
                  </strong>

                  <span>
                    {customer.email}
                  </span>
                </div>

                <div className="admin-user-date">
                  {customer.createdAt
                    ? new Date(
                        customer.createdAt
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "—"}
                </div>

                <div>
                  <span
                    className={
                      customer.skinProfile
                        ? "profile-status saved"
                        : "profile-status"
                    }
                  >
                    {customer.skinProfile
                      ? "Saved"
                      : "Not analysed"}
                  </span>
                </div>

                <div>
                  <span
                    className={
                      customer.hairProfile
                        ? "profile-status saved"
                        : "profile-status"
                    }
                  >
                    {customer.hairProfile
                      ? "Saved"
                      : "Not analysed"}
                  </span>
                </div>

                <div>
                  <span
                    className={
                      customer.colourProfile
                        ? "profile-status saved"
                        : "profile-status"
                    }
                  >
                    {customer.colourProfile
                      ? "Saved"
                      : "Not analysed"}
                  </span>
                </div>

              </article>
            ))}

          </div>
        )}

      </section>

    </main>
  );
}

export default AdminUsers;