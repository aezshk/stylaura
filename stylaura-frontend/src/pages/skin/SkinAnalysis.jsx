
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function SkinAnalysis() {
  const navigate = useNavigate();

  const [image, setImage] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [imageError, setImageError] = useState("");
  const [isImageLoading, setIsImageLoading] = useState(false);

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
    setIsImageLoading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const loadImage = useCallback((dataUrl) => {
    setImageError("");
    setIsImageLoading(true);
    imageRef.current = dataUrl;
    setImage(dataUrl);
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setCameraError("");
    setImageError("");

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setImageError("Please upload a JPG, PNG, or WebP image.");
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
            reject(new Error("The image could not be read."));
            return;
          }

          resolve(reader.result);
        };

        reader.onerror = () => reject(new Error("The image could not be read."));
        reader.readAsDataURL(file);
      });

      // Verify that the file is a decodable image.
      await new Promise((resolve, reject) => {
        const testImage = new Image();

        testImage.onload = () => {
          if (!testImage.naturalWidth || !testImage.naturalHeight) {
            reject(new Error("This image is invalid or unreadable."));
            return;
          }

          if (testImage.naturalWidth < 160 || testImage.naturalHeight < 160) {
            reject(new Error("Please choose a higher-resolution photo."));
            return;
          }

          resolve();
        };

        testImage.onerror = () => reject(new Error("This image is invalid or unreadable."));
        testImage.src = dataUrl;
      });

      stopCamera();
      loadImage(dataUrl);
    } catch (error) {
      setImageError(error.message || "Unable to load this image.");
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
          facingMode: { ideal: "user" },
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
      });

      streamRef.current = stream;
      setCameraOpen(true);
    } catch (error) {
      console.error("Camera access failed:", error);

      const messages = {
        NotAllowedError:
          "Camera permission was denied. Allow camera access in your browser settings.",
        NotFoundError:
          "No available camera was found. Please upload a photo instead.",
        NotReadableError:
          "Your camera may already be in use by another application.",
        OverconstrainedError:
          "Your camera does not support these settings. Try uploading a photo.",
      };

      setCameraError(
        messages[error.name] ||
          "Unable to open your camera. Please upload a photo instead."
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
      console.warn("Video preview could not start:", error);
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
    loadImage(capturedImage);
  };

  const handleContinue = () => {
    if (!imageRef.current) {
      setImageError("Please upload or capture a photo first.");
      return;
    }

    navigate("/skin-analysis/result", {
      state: {
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
    <main className="analysis-page skin-analysis-page">
      <section className="analysis-main">
        <header className="analysis-intro">
          <p className="eyebrow">STYLAURA · SKIN ANALYSIS</p>

          <h1>
            Discover your
            <br />
            <em>skin profile.</em>
          </h1>

          <p className="analysis-description">
            Upload a clear, front-facing photo in natural lighting.
            We'll check whether your image is suitable before analysing it.
          </p>
        </header>

        <div className="skin-analysis-workspace">
          <div className="analysis-options">
            <article className="analysis-option-card">
              <div className="option-icon" aria-hidden="true">↑</div>

              <div className="option-content">
                <p className="option-number">OPTION 01</p>
                <h2>Upload a Photo</h2>
                <p>Choose a clear JPG, PNG, or WebP photo under 10 MB.</p>
              </div>

              <label className="upload-button">
                Choose Photo
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                />
              </label>
            </article>

            <div className="analysis-divider" aria-hidden="true">
              <span />
              <p>OR</p>
              <span />
            </div>

            <article className="analysis-option-card">
              <div className="option-icon" aria-hidden="true">◉</div>

              <div className="option-content">
                <p className="option-number">OPTION 02</p>
                <h2>Use Camera</h2>
                <p>Capture a photo directly from your device.</p>
              </div>

              <button
                type="button"
                className="camera-button"
                onClick={openCamera}
                disabled={cameraLoading}
              >
                {cameraLoading ? "Opening Camera…" : "Open Camera"}
              </button>
            </article>
          </div>

          <section
            className="analysis-preview"
            aria-label="Photo preview"
            aria-live="polite"
          >
            {!image && !cameraOpen && (
              <div className="preview-empty">
                <div className="preview-symbol" aria-hidden="true">✦</div>
                <h3>
                  Your photo
                  <br />
                  will appear here.
                </h3>
                <p>Use a clear, well-lit photo for the best results.</p>
              </div>
            )}

            {cameraOpen && (
              <div className="camera-view">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  aria-label="Live camera preview"
                />

                <div className="camera-controls">
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
              <div className="image-preview">
                <img
                  src={image}
                  alt="Uploaded photo preview for skin analysis"
                  onLoad={() => setIsImageLoading(false)}
                  onError={() => {
                    clearImage();
                    setImageError("Unable to display this photo. Please try another.");
                  }}
                />

                {isImageLoading && (
                  <p className="preview-loading">Loading photo…</p>
                )}

                <div className="preview-overlay">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={clearImage}
                  >
                    Choose Another
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>

        {(cameraError || imageError) && (
          <div className="analysis-error" role="alert">
            {imageError || cameraError}
          </div>
        )}

        <footer className="analysis-bottom">
          <p>
            Upload only a photo you're comfortable using for this analysis.
            An image upload alone does not establish a skin condition.
          </p>

          <button
            type="button"
            className="analysis-continue"
            onClick={handleContinue}
            disabled={!image || isImageLoading}
          >
            Continue to Analysis <span aria-hidden="true">→</span>
          </button>
        </footer>
      </section>

      <canvas ref={canvasRef} hidden />
    </main>
  );
}

export default SkinAnalysis;
