import API_BASE_URL from "../../api;
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const API_URL = "${API_BASE_URL}/api/products";
const IMAGE_API_URL = "${API_BASE_URL}/api/product-images";
const BACKEND_URL = "${API_BASE_URL}";

const emptyForm = {
  name: "",
  brand: "",
  category: "",
  subcategory: "",
  description: "",
  price: "",
  image: "",
  stock: "",
  suitableSkinTypes: "",
  suitableHairTypes: "",
  suitableUndertones: "",
  suitableContrasts: "",
  tags: "",
  isStylaura: false,
  isActive: true,
};

function AdminProducts() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImageId, setUploadingImageId] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user || user.role !== "admin") {
      navigate("/admin/login", {
        replace: true,
      });
      return;
    }

    loadProducts();
  }, [user, authLoading, navigate]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/admin`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load products."
        );
      }

      setProducts(data.products || []);
    } catch (error) {
      console.error("Admin products error:", error);

      setError(
        error.message || "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    if (image.startsWith("/")) {
      return `${BACKEND_URL}${image}`;
    }

    return image;
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedImage(null);
      setImagePreview("");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please select a JPG, JPEG, PNG or WEBP image."
      );
      setSelectedImage(null);
      setImagePreview("");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      setSelectedImage(null);
      setImagePreview("");
      return;
    }

    setError("");
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const resetImageSelection = () => {
    setSelectedImage(null);
    setImagePreview("");
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setSuccess("");
    resetImageSelection();
  };

  const convertToArray = (value) => {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const uploadProductImage = async (productId, file) => {
    if (!file) {
      return null;
    }

    const formData = new FormData();

    formData.append("image", file);
    formData.append("brand", form.brand);

    const response = await fetch(
      `${IMAGE_API_URL}/${productId}`,
      {
        method: "POST",
        credentials: "include",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to upload product image."
      );
    }

    return data.product;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        name: form.name.trim(),
        brand: form.brand.trim(),
        category: form.category.trim(),
        subcategory: form.subcategory.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        image: form.image.trim(),
        stock: Number(form.stock),

        suitableSkinTypes:
          convertToArray(form.suitableSkinTypes),

        suitableHairTypes:
          convertToArray(form.suitableHairTypes),

        suitableUndertones:
          convertToArray(form.suitableUndertones),

        suitableContrasts:
          convertToArray(form.suitableContrasts),

        tags: convertToArray(form.tags),

        isStylaura: form.isStylaura,
        isActive: form.isActive,
      };

      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to save product."
        );
      }

      let savedProduct = data.product;

      if (selectedImage) {
        savedProduct = await uploadProductImage(
          savedProduct._id,
          selectedImage
        );
      }

      if (editingId) {
        setProducts((current) =>
          current.map((product) =>
            product._id === editingId
              ? savedProduct
              : product
          )
        );

        setSuccess(
          selectedImage
            ? "Product and image updated successfully."
            : "Product updated successfully."
        );
      } else {
        setProducts((current) => [
          savedProduct,
          ...current,
        ]);

        setSuccess(
          selectedImage
            ? "Product and image added successfully."
            : "Product added successfully."
        );
      }

      setForm(emptyForm);
      setEditingId(null);
      resetImageSelection();
    } catch (error) {
      console.error("Save product error:", error);

      setError(
        error.message || "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);

    setForm({
      name: product.name || "",
      brand: product.brand || "",
      category: product.category || "",
      subcategory: product.subcategory || "",
      description: product.description || "",
      price:
        product.price !== undefined
          ? product.price
          : "",
      image: product.image || "",
      stock:
        product.stock !== undefined
          ? product.stock
          : "",

      suitableSkinTypes: Array.isArray(
        product.suitableSkinTypes
      )
        ? product.suitableSkinTypes.join(", ")
        : "",

      suitableHairTypes: Array.isArray(
        product.suitableHairTypes
      )
        ? product.suitableHairTypes.join(", ")
        : "",

      suitableUndertones: Array.isArray(
        product.suitableUndertones
      )
        ? product.suitableUndertones.join(", ")
        : "",

      suitableContrasts: Array.isArray(
        product.suitableContrasts
      )
        ? product.suitableContrasts.join(", ")
        : "",

      tags: Array.isArray(product.tags)
        ? product.tags.join(", ")
        : "",

      isStylaura: Boolean(product.isStylaura),

      isActive:
        product.isActive !== false,
    });

    setError("");
    setSuccess("");
    resetImageSelection();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete product."
        );
      }

      setProducts((current) =>
        current.filter(
          (product) => product._id !== id
        )
      );

      setSuccess(
        "Product deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete product error:",
        error
      );

      setError(
        error.message ||
          "Unable to delete product."
      );
    }
  };

  const handleListImageUpload = async (
    product,
    event
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please select a JPG, JPEG, PNG or WEBP image."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setUploadingImageId(product._id);

      const formData = new FormData();

      formData.append("image", file);
      formData.append("brand", product.brand);

      const response = await fetch(
        `${IMAGE_API_URL}/${product._id}`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to upload product image."
        );
      }

      setProducts((current) =>
        current.map((item) =>
          item._id === product._id
            ? data.product
            : item
        )
      );

      setSuccess(
        `Image uploaded for ${product.name}.`
      );
    } catch (error) {
      console.error(
        "Product image upload error:",
        error
      );

      setError(
        error.message ||
          "Unable to upload product image."
      );
    } finally {
      setUploadingImageId(null);

      event.target.value = "";
    }
  };

  if (authLoading || loading) {
    return (
      <main className="admin-page">
        <section className="admin-loading">
          <p className="eyebrow">
            STYLAURA • PRODUCTS
          </p>

          <h1>
            Loading
            <br />
            <em>products.</em>
          </h1>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <section className="admin-users-header">
        <div>
          <p className="eyebrow">
            STYLAURA • PRODUCT MANAGEMENT
          </p>

          <h1>
            Beauty
            <br />
            <em>collection.</em>
          </h1>

          <p>
            Add and manage the products shown
            across the STYLAURA experience.
          </p>
        </div>

        <Link
          to="/admin"
          className="admin-back-link"
        >
          ← Admin Dashboard
        </Link>
      </section>

      <section className="admin-product-form-section">
        <div className="admin-users-section-heading">
          <div>
            <p className="eyebrow">
              {editingId
                ? "EDIT PRODUCT"
                : "ADD PRODUCT"}
            </p>

            <h2>
              {editingId
                ? "Update your"
                : "Add a new"}
              <br />
              <em>product.</em>
            </h2>
          </div>
        </div>

        <form
          className="admin-product-form"
          onSubmit={handleSubmit}
        >
          <div className="admin-product-form-grid">
            <div className="auth-field">
              <label htmlFor="product-name">
                Product Name
              </label>

              <input
                id="product-name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Hydrating Face Serum"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="product-brand">
                Brand
              </label>

              <input
                id="product-brand"
                name="brand"
                type="text"
                value={form.brand}
                onChange={handleChange}
                placeholder="e.g. STYLAURA"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="product-category">
                Category
              </label>

              <select
                id="product-category"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select category
                </option>

                <option value="Makeup">
                  Makeup
                </option>

                <option value="Skincare">
                  Skincare
                </option>

                <option value="Haircare">
                  Haircare
                </option>

                <option value="Clothing">
                  Clothing
                </option>

                <option value="Accessories">
                  Accessories
                </option>
              </select>
            </div>

            <div className="auth-field">
              <label htmlFor="product-subcategory">
                Subcategory
              </label>

              <input
                id="product-subcategory"
                name="subcategory"
                type="text"
                value={form.subcategory}
                onChange={handleChange}
                placeholder="e.g. Lipstick, Dress, Serum"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="product-price">
                Price
              </label>

              <input
                id="product-price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="e.g. 999"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="product-stock">
                Stock
              </label>

              <input
                id="product-stock"
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={handleChange}
                placeholder="e.g. 50"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="product-image">
                Image URL
              </label>

              <input
                id="product-image"
                name="image"
                type="text"
                value={form.image}
                onChange={handleChange}
                placeholder="Optional image URL"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="product-image-file">
                Upload Product Image
              </label>

              <input
                id="product-image-file"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={handleImageSelect}
              />

              <small>
                JPG, PNG or WEBP • Maximum 5 MB
              </small>

              {imagePreview && (
                <div className="admin-image-upload-preview">
                  <img
                    src={imagePreview}
                    alt="Selected product preview"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="product-description">
              Description
            </label>

            <textarea
              id="product-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the product..."
              rows="4"
            />
          </div>

          <div className="admin-personalization-section">
            <div className="admin-users-section-heading">
              <div>
                <p className="eyebrow">
                  PERSONALIZATION
                </p>

                <h3>
                  Who is this
                  <br />
                  <em>product for?</em>
                </h3>

                <p>
                  Separate multiple options with
                  commas.
                </p>
              </div>
            </div>

            <div className="admin-product-form-grid">
              <div className="auth-field">
                <label htmlFor="skin-types">
                  Suitable Skin Types
                </label>

                <input
                  id="skin-types"
                  name="suitableSkinTypes"
                  type="text"
                  value={form.suitableSkinTypes}
                  onChange={handleChange}
                  placeholder="Combination, Dry, Oily"
                />
              </div>

              <div className="auth-field">
                <label htmlFor="hair-types">
                  Suitable Hair Types
                </label>

                <input
                  id="hair-types"
                  name="suitableHairTypes"
                  type="text"
                  value={form.suitableHairTypes}
                  onChange={handleChange}
                  placeholder="Straight, Wavy, Curly"
                />
              </div>

              <div className="auth-field">
                <label htmlFor="undertones">
                  Suitable Undertones
                </label>

                <input
                  id="undertones"
                  name="suitableUndertones"
                  type="text"
                  value={form.suitableUndertones}
                  onChange={handleChange}
                  placeholder="Warm, Cool, Neutral"
                />
              </div>

              <div className="auth-field">
                <label htmlFor="contrasts">
                  Suitable Contrast
                </label>

                <input
                  id="contrasts"
                  name="suitableContrasts"
                  type="text"
                  value={form.suitableContrasts}
                  onChange={handleChange}
                  placeholder="Low, Medium, High"
                />
              </div>

              <div className="auth-field">
                <label htmlFor="product-tags">
                  Recommendation Tags
                </label>

                <input
                  id="product-tags"
                  name="tags"
                  type="text"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="Everyday, Nude, Hydrating"
                />
              </div>
            </div>
          </div>

          <div className="admin-product-options">
            <label className="admin-checkbox">
              <input
                type="checkbox"
                name="isStylaura"
                checked={form.isStylaura}
                onChange={handleChange}
              />

              <span>
                STYLAURA Product
              </span>
            </label>

            <label className="admin-checkbox">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
              />

              <span>
                Active Product
              </span>
            </label>
          </div>

          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}

          {success && (
            <p className="admin-success">
              {success}
            </p>
          )}

          <div className="admin-product-form-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Product"
                : "Add Product"}
            </button>

            {editingId && (
              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="admin-users-section">
        <div className="admin-users-section-heading">
          <div>
            <p className="eyebrow">
              PRODUCT CATALOGUE
            </p>

            <h2>
              Your
              <br />
              <em>products.</em>
            </h2>
          </div>

          <span>
            {products.length} products
          </span>
        </div>

        {products.length === 0 ? (
          <div className="admin-empty">
            <h3>
              No products yet.
            </h3>

            <p>
              Add your first product using
              the form above.
            </p>
          </div>
        ) : (
          <div className="admin-product-list">
            {products.map((product) => (
              <article
                key={product._id}
                className="admin-product-row"
              >
                <div className="admin-product-image">
                  {product.image ? (
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                    />
                  ) : (
                    <span>
                      {product.name
                        ?.charAt(0)
                        ?.toUpperCase() || "S"}
                    </span>
                  )}
                </div>

                <div className="admin-product-info">
                  <strong>
                    {product.name}
                  </strong>

                  <span>
                    {product.brand} •{" "}
                    {product.category}
                    {product.subcategory
                      ? ` • ${product.subcategory}`
                      : ""}
                  </span>

                  <small>
                    {product.isStylaura
                      ? "STYLAURA"
                      : "PARTNER BRAND"}
                    {" • "}
                    {product.isActive
                      ? "Active"
                      : "Inactive"}
                  </small>
                </div>

                <div className="admin-product-price">
                  ₹
                  {Number(
                    product.price || 0
                  ).toLocaleString("en-IN")}
                </div>

                <div className="admin-product-stock">
                  <span>Stock</span>

                  <strong>
                    {product.stock}
                  </strong>
                </div>

                <div className="admin-product-actions">
                  <button
                    type="button"
                    className="admin-small-button"
                    onClick={() =>
                      handleEdit(product)
                    }
                  >
                    Edit
                  </button>

                  <label className="admin-small-button">
                    {uploadingImageId ===
                    product._id
                      ? "Uploading..."
                      : "Image"}

                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      onChange={(event) =>
                        handleListImageUpload(
                          product,
                          event
                        )
                      }
                      disabled={
                        uploadingImageId ===
                        product._id
                      }
                      hidden
                    />
                  </label>

                  <button
                    type="button"
                    className="admin-small-button danger"
                    onClick={() =>
                      handleDelete(
                        product._id
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
    </main>
  );
}

export default AdminProducts;