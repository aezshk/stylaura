import API_BASE_URL from "../../api;
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const emptyForm = {
  name: "",
  type: "Partner",
  category: "Beauty",
  description: "",
  isActive: true,
};

function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "${API_BASE_URL}/api/admin/brands",
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load brands."
        );
      }

      setBrands(data.brands || []);
    } catch (error) {
      console.error("Load brands error:", error);

      setError(
        error.message || "Unable to load brands."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const url = editingId
        ? `${API_BASE_URL}/api/admin/brands/${editingId}`
        : "${API_BASE_URL}/api/admin/brands";

      const method = editingId
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save brand."
        );
      }

      if (editingId) {
        setBrands((current) =>
          current.map((brand) =>
            brand._id === editingId
              ? data.brand
              : brand
          )
        );

        setMessage(
          "Brand updated successfully."
        );
      } else {
        setBrands((current) => [
          data.brand,
          ...current,
        ]);

        setMessage(
          "Brand created successfully."
        );
      }

      setForm(emptyForm);
      setEditingId(null);
    } catch (error) {
      console.error(
        "Save brand error:",
        error
      );

      setError(
        error.message ||
          "Unable to save brand."
      );
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (brand) => {
    setEditingId(brand._id);

    setForm({
      name: brand.name || "",
      type: brand.type || "Partner",
      category:
        brand.category || "Beauty",
      description:
        brand.description || "",
      isActive:
        brand.isActive !== false,
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
  };

  const deleteBrand = async (brandId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this brand?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/api/admin/brands/${brandId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete brand."
        );
      }

      setBrands((current) =>
        current.filter(
          (brand) =>
            brand._id !== brandId
        )
      );

      if (editingId === brandId) {
        cancelEditing();
      }

      setMessage(
        "Brand deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete brand error:",
        error
      );

      setError(
        error.message ||
          "Unable to delete brand."
      );
    }
  };

  return (
    <main className="admin-page">
      <section className="admin-brands-page">

        <div className="admin-brands-header">
          <div>
            <p className="eyebrow">
              STYLAURA • BRANDS
            </p>

            <h1>
              Brand
              <br />
              <em>marketplace.</em>
            </h1>

            <p>
              Manage STYLAURA and partner
              beauty brands available across
              the platform.
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
          <div className="admin-brands-error">
            {error}
          </div>
        )}

        {message && (
          <div className="admin-brands-message">
            {message}
          </div>
        )}


        {/* =================================================
            BRAND FORM
        ================================================= */}

        <section className="admin-brand-form-card">

          <div>
            <p className="eyebrow">
              {editingId
                ? "EDIT BRAND"
                : "ADD BRAND"}
            </p>

            <h2>
              {editingId
                ? "Update the"
                : "Create a"}
              <br />
              <em>brand.</em>
            </h2>
          </div>


          <form
            className="admin-brand-form"
            onSubmit={handleSubmit}
          >

            <div className="admin-brand-form-grid">

              <label>
                <span>
                  Brand name
                </span>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. STYLAURA"
                  required
                />
              </label>


              <label>
                <span>
                  Brand type
                </span>

                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                >
                  <option value="STYLAURA">
                    STYLAURA
                  </option>

                  <option value="Partner">
                    Partner
                  </option>
                </select>
              </label>


              <label>
                <span>
                  Category
                </span>

                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Beauty"
                />
              </label>


              <label className="admin-brand-active">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                />

                <span>
                  Active brand
                </span>
              </label>

            </div>


            <label>
              <span>
                Description
              </span>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Short description of the brand."
                rows="4"
              />
            </label>


            <div className="admin-brand-form-actions">

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Brand"
                  : "Add Brand"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={cancelEditing}
                >
                  Cancel
                </button>
              )}

            </div>

          </form>
        </section>


        {/* =================================================
            BRAND LIST
        ================================================= */}

        <section className="admin-brands-list-section">

          <div className="admin-brands-list-heading">
            <div>
              <p className="eyebrow">
                BRAND DIRECTORY
              </p>

              <h2>
                Your
                <br />
                <em>brands.</em>
              </h2>
            </div>

            <span>
              {brands.length} brands
            </span>
          </div>


          {loading ? (
            <div className="admin-brands-empty">
              Loading brands...
            </div>
          ) : brands.length === 0 ? (
            <div className="admin-brands-empty">
              <p className="eyebrow">
                NO BRANDS
              </p>

              <h3>
                Your brand
                <br />
                <em>directory is empty.</em>
              </h3>

              <p>
                Add your first STYLAURA or
                partner brand above.
              </p>
            </div>
          ) : (
            <div className="admin-brands-grid">
              {brands.map((brand) => (
                <article
                  className="admin-brand-card"
                  key={brand._id}
                >

                  <div className="admin-brand-card-top">
                    <span>
                      {brand.type}
                    </span>

                    <span
                      className={
                        brand.isActive
                          ? "brand-status active"
                          : "brand-status inactive"
                      }
                    >
                      {brand.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>


                  <h3>
                    {brand.name}
                  </h3>


                  <p className="admin-brand-category">
                    {brand.category}
                  </p>


                  <p className="admin-brand-description">
                    {brand.description ||
                      "No brand description added yet."}
                  </p>


                  <div className="admin-brand-card-actions">

                    <button
                      type="button"
                      onClick={() =>
                        startEditing(
                          brand
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteBrand(
                          brand._id
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                </article>
              ))}
            </div>
          )}

        </section>

      </section>
    </main>
  );
}

export default AdminBrands;