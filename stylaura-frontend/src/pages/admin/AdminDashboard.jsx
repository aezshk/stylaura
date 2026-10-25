import API_BASE_URL from "../../api";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AdminDashboard() {
  const navigate = useNavigate();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      navigate("/admin/login", {
        replace: true,
      });
      return;
    }

    if (user.role !== "admin") {
      navigate("/admin/login", {
        replace: true,
      });
      return;
    }

    const loadDashboard = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/admin/dashboard`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load admin dashboard."
          );
        }

        setStats(data.stats);
      } catch (error) {
        console.error(
          "Admin dashboard error:",
          error
        );

        setError(
          error.message ||
            "Unable to load admin dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <main className="admin-page">
        <section className="admin-loading">
          <p className="eyebrow">
            STYLAURA ADMIN
          </p>

          <h1>
            Loading your
            <br />
            <em>dashboard.</em>
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
            STYLAURA ADMIN
          </p>

          <h1>
            Something went
            <br />
            <em>wrong.</em>
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

  return (
    <main className="admin-page">

      {/* HEADER */}

      <section className="admin-header">

        <div>

          <p className="eyebrow">
            STYLAURA • ADMINISTRATION
          </p>

          <h1>
            Welcome,
            <br />
            <em>{user.name}.</em>
          </h1>

          <p className="admin-intro">
            Manage your STYLAURA platform,
            customers and personalized beauty
            experience from one place.
          </p>

        </div>

      </section>


      {/* STATISTICS */}

      <section className="admin-stats">

        <article className="admin-stat-card">
          <span>01</span>

          <p>REGISTERED CUSTOMERS</p>

          <strong>
            {stats?.totalUsers ?? 0}
          </strong>

          <small>
            Customer accounts
          </small>
        </article>


        <article className="admin-stat-card">
          <span>02</span>

          <p>SKIN PROFILES</p>

          <strong>
            {stats?.usersWithSkinProfiles ?? 0}
          </strong>

          <small>
            Completed skin analyses
          </small>
        </article>


        <article className="admin-stat-card">
          <span>03</span>

          <p>HAIR PROFILES</p>

          <strong>
            {stats?.usersWithHairProfiles ?? 0}
          </strong>

          <small>
            Completed hair analyses
          </small>
        </article>


        <article className="admin-stat-card">
          <span>04</span>

          <p>COLOUR PROFILES</p>

          <strong>
            {stats?.usersWithColourProfiles ?? 0}
          </strong>

          <small>
            Completed colour analyses
          </small>
        </article>

      </section>


      {/* MANAGEMENT */}

      <section className="admin-management">

        <div className="admin-management-heading">

          <p className="eyebrow">
            MANAGEMENT
          </p>

          <h2>
            Manage the
            <br />
            <em>
              STYLAURA experience.
            </em>
          </h2>

        </div>


        <div className="admin-management-grid">


          {/* USERS */}

          <Link
            to="/admin/users"
            className="admin-management-card"
          >
            <span>01</span>

            <div>
              <p>USERS</p>

              <h3>
                Customer
                <br />
                accounts
              </h3>

              <small>
                View and manage registered
                STYLAURA customers.
              </small>
            </div>

            <strong>→</strong>
          </Link>


          {/* PRODUCTS */}

          <Link
            to="/admin/products"
            className="admin-management-card"
          >
            <span>02</span>

            <div>
              <p>PRODUCTS</p>

              <h3>
                Beauty
                <br />
                collection
              </h3>

              <small>
                Manage STYLAURA and partner
                beauty products.
              </small>
            </div>

            <strong>→</strong>
          </Link>


          {/* BRANDS */}

          <Link
            to="/admin/brands"
            className="admin-management-card"
          >
            <span>03</span>

            <div>
              <p>BRANDS</p>

              <h3>
                Brand
                <br />
                marketplace
              </h3>

              <small>
                Manage national and international
                beauty brands.
              </small>
            </div>

            <strong>→</strong>
          </Link>


          {/* GAME */}

          <Link
            to="/admin/game"
            className="admin-management-card"
          >
            <span>04</span>

            <div>
              <p>GAME</p>

              <h3>
                Play &
                <br />
                Unlock
              </h3>

              <small>
                Manage the STYLAURA game and
                product unlock experience.
              </small>
            </div>

            <strong>→</strong>
          </Link>


          {/* ORDERS */}

          <Link
            to="/admin/orders"
            className="admin-management-card"
          >
            <span>05</span>

            <div>
              <p>ORDERS</p>

              <h3>
                Customer
                <br />
                orders
              </h3>

              <small>
                Track orders and manage
                fulfillment.
              </small>
            </div>

            <strong>→</strong>
          </Link>


          {/* ANALYTICS */}

          <Link
            to="/admin/analytics"
            className="admin-management-card"
          >
            <span>06</span>

            <div>
              <p>ANALYTICS</p>

              <h3>
                Platform
                <br />
                insights
              </h3>

              <small>
                Understand customer activity
                and platform performance.
              </small>
            </div>

            <strong>→</strong>
          </Link>

        </div>

      </section>

    </main>
  );
}

export default AdminDashboard;