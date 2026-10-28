
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const HAIR_TYPES = ["Straight", "Wavy", "Curly", "Coily"];

const HAIR_CONCERNS = [
  "Dryness",
  "Frizz",
  "Hair Fall",
  "Damage",
  "Dandruff",
  "Lack of Volume",
];

function HairAnalysis() {
  const navigate = useNavigate();

  const [hairType, setHairType] = useState("");
  const [concern, setConcern] = useState("");
  const [image, setImage] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [imageError, setImageError] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageRef = useRef("");

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOpen(false);
    setCameraLoading(false);
  }, []);

  const clearImage = useCallback(() => {
    imageRef.current = "";
    setImage("");
    setImageError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const acceptImage = useCallback((dataUrl) => {
    imageRef.current = dataUrl;
    setImage(dataUrl);
    setImageError("");
    setCameraError("");
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setImageError("");
    setCameraError("");

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setImageError("Please choose a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setImageError("Your photo must be smaller than 10 MB.");
      event.target.value = "";
      return;
    }

    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          if (typeof reader.result !== "string") {
            reject(new Error("Unable to read this photo."));
            return;
          }

          resolve(reader.result);
        };

        reader.onerror = () => reject(new Error("Unable to read this photo."));
        reader.readAsDataURL(file);
      });

      await new Promise((resolve, reject) => {
        const testImage = new Image();

        testImage.onload = () => {
          if (!testImage.naturalWidth || !testImage.naturalHeight) {
            reject(new Error("This image is invalid or unreadable."));
            return;
          }

          if (
            testImage.naturalWidth < 160 ||
            testImage.naturalHeight < 160
          ) {
            reject(new Error("Please choose a higher-resolution photo."));
            return;
          }

          resolve();
        };

        testImage.onerror = () => reject(
          new Error("This image is invalid or unreadable.")
        );

        testImage.src = dataUrl;
      });

      stopCamera();
      acceptImage(dataUrl);
    } catch (error) {
      setImageError(error.message || "Unable to load this photo.");
    }
  };

  const openCamera = async () => {
    setCameraError("");
    setImageError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        "Camera access is unavailable. Use HTTPS or upload a photo instead."
      );
      return;
    }

    setCameraLoading(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
      });

      streamRef.current = stream;
      setCameraOpen(true);
    } catch (error) {
      console.error("Hair camera access failed:", error);

      const messages = {
        NotAllowedError:
          "Camera permission was denied. Allow camera access in browser settings.",
        NotFoundError:
          "No available camera was found. Please upload a photo instead.",
        NotReadableError:
          "Your camera may already be in use by another application.",
      };

      setCameraError(
        messages[error.name] ||
          "Unable to open the camera. Please upload a photo instead."
      );
    } finally {
      setCameraLoading(false);
    }
  };

  useEffect(() => {
    if (!cameraOpen || !streamRef.current || !videoRef.current) return;

    const video = videoRef.current;
    video.srcObject = streamRef.current;

    video.play().catch((error) => {
      console.warn("Hair camera preview could not start:", error);
      setCameraError("Unable to start the camera preview. Please try again.");
    });
  }, [cameraOpen]);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !video.videoWidth || !video.videoHeight) {
      setCameraError("Please wait until the camera preview is ready.");
      return;
    }

    const maxDimension = 1600;
    const scale = Math.min(
      1,
      maxDimension / Math.max(video.videoWidth, video.videoHeight)
    );

    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);

    const context = canvas.getContext("2d");

    if (!context) {
      setCameraError("Unable to capture the photo. Please try again.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const capturedImage = canvas.toDataURL("image/jpeg", 0.88);

    stopCamera();
    acceptImage(capturedImage);
  };

  const handleContinue = () => {
    setCameraError("");
    setImageError("");

    if (!hairType || !concern) {
      setCameraError("Please select your hair type and main concern.");
      return;
    }

    if (!imageRef.current) {
      setCameraError("Please upload or capture a hair photo first.");
      return;
    }

    navigate("/hair-analysis/result", {
      state: {
        hairType,
        concern,
        image: imageRef.current,
      },
    });
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <main className="analysis-page hair-analysis-page">
      <section className="hair-analysis-main">
        <header className="analysis-intro">
          <p className="eyebrow">STYLAURA · HAIR ANALYSIS</p>

          <h1>
            Understand your
            <br />
            <em>hair needs.</em>
          </h1>

          <p className="analysis-description">
            Add a clear photo showing your hair or scalp, then select
            your hair type and main concern.
          </p>
        </header>

        <section className="hair-photo-section">
          <div className="hair-photo-heading">
            <div>
              <p className="question-label">PHOTO</p>
              <h2>Show us your hair.</h2>
              <p>
                Use a well-lit photo where your hair or scalp is clearly
                visible. Your photo will need to pass image-content
                validation before an AI analysis can be trusted.
              </p>
            </div>

            {image && (
              <button
                type="button"
                className="photo-remove"
                onClick={clearImage}
              >
                Remove photo
              </button>
            )}
          </div>

          <div className="hair-photo-workspace">
            <div className="hair-photo-preview">
              {!image && !cameraOpen && (
                <div className="hair-photo-empty">
                  <span aria-hidden="true">✦</span>
                  <h3>
                    Add a clear
                    <br />
                    hair photo.
                  </h3>
                  <p>Natural lighting works best.</p>
                </div>
              )}

              {cameraOpen && (
                <div className="hair-camera-view">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    aria-label="Live camera preview"
                  />

                  <div className="hair-camera-controls">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={stopCamera}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="primary-button"
                      onClick={capturePhoto}
                    >
                      Capture Photo
                    </button>
                  </div>
                </div>
              )}

              {image && !cameraOpen && (
                <div className="hair-image-preview">
                  <img
                    src={image}
                    alt="Uploaded hair photo preview"
                  />
                </div>
              )}
            </div>

            {!cameraOpen && (
              <div className="hair-photo-actions">
                <label className="upload-button">
                  Upload Photo
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                  />
                </label>

                <button
                  type="button"
                  className="camera-button"
                  onClick={openCamera}
                  disabled={cameraLoading}
                >
                  {cameraLoading ? "Opening Camera…" : "Use Camera"}
                </button>
              </div>
            )}
          </div>
        </section>

        <div className="hair-analysis-layout">
          <section className="hair-form-card">
            <div className="hair-question">
              <div className="question-heading">
                <span className="question-number">01</span>
                <div>
                  <p className="question-label">HAIR TYPE</p>
                  <h2>What is your hair type?</h2>
                </div>
              </div>

              <div className="hair-options">
                {HAIR_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={hairType === type}
                    className={
                      hairType === type
                        ? "hair-option selected"
                        : "hair-option"
                    }
                    onClick={() => setHairType(type)}
                  >
                    <span>{type}</span>
                    {hairType === type && (
                      <span className="option-check" aria-hidden="true">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="question-separator" />

            <div className="hair-question">
              <div className="question-heading">
                <span className="question-number">02</span>
                <div>
                  <p className="question-label">HAIR CONCERN</p>
                  <h2>What would you like to improve?</h2>
                </div>
              </div>

              <div className="hair-options concern-options">
                {HAIR_CONCERNS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={concern === item}
                    className={
                      concern === item
                        ? "hair-option selected"
                        : "hair-option"
                    }
                    onClick={() => setConcern(item)}
                  >
                    <span>{item}</span>
                    {concern === item && (
                      <span className="option-check" aria-hidden="true">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <aside className="hair-side-card">
            <div className="side-symbol" aria-hidden="true">✦</div>
            <p className="side-label">YOUR HAIR PROFILE</p>

            <h3>
              Small details
              <br />
              create the
              <br />
              <em>right routine.</em>
            </h3>

            <p>
              Your answers are self-reported preferences. Image-based
              observations will be shown separately after image validation.
            </p>

            <div className="profile-summary">
              <div>
                <span>Photo</span>
                <strong>{image ? "Added" : "Not added"}</strong>
              </div>

              <div>
                <span>Hair type</span>
                <strong>{hairType || "Not selected"}</strong>
              </div>

              <div>
                <span>Main concern</span>
                <strong>{concern || "Not selected"}</strong>
              </div>
            </div>
          </aside>
        </div>

        {(cameraError || imageError) && (
          <div className="analysis-error" role="alert">
            {imageError || cameraError}
          </div>
        )}

        <footer className="analysis-bottom">
          <p>
            Your photo and answers are used to prepare your hair profile.
          </p>

          <button
            type="button"
            className="analysis-continue"
            disabled={!hairType || !concern || !image}
            onClick={handleContinue}
          >
            Continue to Analysis <span aria-hidden="true">→</span>
          </button>
        </footer>
      </section>

      <canvas ref={canvasRef} hidden />
    </main>
  );
}

export default HairAnalysis;
