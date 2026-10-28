import API_BASE_URL from "../../api;
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const emptyForm = {
  title: "",
  description: "",
  reward: "",
  rewardType: "discount",
  rewardValue: 0,
  isActive: true,
};

function AdminGame() {
  const [games, setGames] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "${API_BASE_URL}/api/games/admin",
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load games."
        );
      }

      setGames(data.games || []);
    } catch (error) {
      console.error("Load games error:", error);

      setError(
        error.message || "Unable to load games."
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
          : name === "rewardValue"
          ? value
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
        ? `${API_BASE_URL}/api/games/admin/${editingId}`
        : "${API_BASE_URL}/api/games/admin";

      const method = editingId
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          rewardValue:
            Number(form.rewardValue) || 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save game."
        );
      }

      if (editingId) {
        setGames((current) =>
          current.map((game) =>
            game._id === editingId
              ? data.game
              : game
          )
        );

        setMessage(
          "Game updated successfully."
        );
      } else {
        setGames((current) => [
          data.game,
          ...current,
        ]);

        setMessage(
          "Game created successfully."
        );
      }

      setForm(emptyForm);
      setEditingId(null);
    } catch (error) {
      console.error(
        "Save game error:",
        error
      );

      setError(
        error.message ||
          "Unable to save game."
      );
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (game) => {
    setEditingId(game._id);

    setForm({
      title: game.title || "",
      description:
        game.description || "",
      reward: game.reward || "",
      rewardType:
        game.rewardType || "discount",
      rewardValue:
        game.rewardValue || 0,
      isActive:
        game.isActive !== false,
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

  const deleteGame = async (gameId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this game?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/api/games/admin/${gameId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete game."
        );
      }

      setGames((current) =>
        current.filter(
          (game) =>
            game._id !== gameId
        )
      );

      if (editingId === gameId) {
        cancelEditing();
      }

      setMessage(
        "Game deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete game error:",
        error
      );

      setError(
        error.message ||
          "Unable to delete game."
      );
    }
  };

  return (
    <main className="admin-page">
      <section className="admin-game-page">

        <div className="admin-game-header">
          <div>
            <p className="eyebrow">
              STYLAURA • PLAY & UNLOCK
            </p>

            <h1>
              Game &
              <br />
              <em>rewards.</em>
            </h1>

            <p>
              Create and manage interactive
              experiences and customer rewards.
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
          <div className="admin-game-error">
            {error}
          </div>
        )}

        {message && (
          <div className="admin-game-message">
            {message}
          </div>
        )}


        {/* =================================================
            GAME FORM
        ================================================= */}

        <section className="admin-game-form-card">

          <div>
            <p className="eyebrow">
              {editingId
                ? "EDIT EXPERIENCE"
                : "ADD EXPERIENCE"}
            </p>

            <h2>
              {editingId
                ? "Update the"
                : "Create a"}
              <br />
              <em>game.</em>
            </h2>
          </div>


          <form
            className="admin-game-form"
            onSubmit={handleSubmit}
          >

            <div className="admin-game-form-grid">

              <label>
                <span>
                  Game title
                </span>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Beauty Spin"
                  required
                />
              </label>


              <label>
                <span>
                  Reward
                </span>

                <input
                  type="text"
                  name="reward"
                  value={form.reward}
                  onChange={handleChange}
                  placeholder="e.g. 10% OFF"
                  required
                />
              </label>


              <label>
                <span>
                  Reward type
                </span>

                <select
                  name="rewardType"
                  value={form.rewardType}
                  onChange={handleChange}
                >
                  <option value="discount">
                    Discount
                  </option>

                  <option value="product">
                    Product
                  </option>

                  <option value="points">
                    Points
                  </option>

                  <option value="gift">
                    Gift
                  </option>
                </select>
              </label>


              <label>
                <span>
                  Reward value
                </span>

                <input
                  type="number"
                  name="rewardValue"
                  value={form.rewardValue}
                  onChange={handleChange}
                  min="0"
                  placeholder="10"
                />
              </label>


              <label className="admin-game-active">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                />

                <span>
                  Active experience
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
                placeholder="Describe how the customer experience works."
                rows="4"
              />
            </label>


            <div className="admin-game-form-actions">

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Game"
                  : "Add Game"}
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
            GAME DIRECTORY
        ================================================= */}

        <section className="admin-game-list-section">

          <div className="admin-game-list-heading">
            <div>
              <p className="eyebrow">
                EXPERIENCE DIRECTORY
              </p>

              <h2>
                Your
                <br />
                <em>games.</em>
              </h2>
            </div>

            <span>
              {games.length} experiences
            </span>
          </div>


          {loading ? (
            <div className="admin-game-empty">
              Loading games...
            </div>
          ) : games.length === 0 ? (
            <div className="admin-game-empty">
              <p className="eyebrow">
                NO GAMES
              </p>

              <h3>
                Your reward
                <br />
                <em>directory is empty.</em>
              </h3>

              <p>
                Create your first Play &
                Unlock experience above.
              </p>
            </div>
          ) : (
            <div className="admin-game-grid">
              {games.map((game) => (
                <article
                  className="admin-game-card"
                  key={game._id}
                >

                  <div className="admin-game-card-top">
                    <span>
                      {game.rewardType}
                    </span>

                    <span
                      className={
                        game.isActive
                          ? "game-status active"
                          : "game-status inactive"
                      }
                    >
                      {game.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>


                  <h3>
                    {game.title}
                  </h3>


                  <p className="admin-game-reward">
                    {game.reward}
                  </p>


                  <p className="admin-game-description">
                    {game.description ||
                      "No game description added yet."}
                  </p>


                  <div className="admin-game-card-actions">

                    <button
                      type="button"
                      onClick={() =>
                        startEditing(game)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteGame(
                          game._id
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

export default AdminGame;