import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function SkinAnalysis() {
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  /* =========================
     FILE UPLOAD
  ========================== */

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setCameraError("Please choose a valid image file.");
      return;
    }

    setCameraError("");

    const reader = new FileReader();

    reader.onload = () => {
      setImage(reader.result);
    };

    reader.readAsDataURL(file);
  };


  /* =========================
     CAMERA
  ========================== */

  const openCamera = async () => {
    setCameraError("");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError(
          "Camera access is not supported by this browser."
        );
        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
          },
          audio: false,
        });

      streamRef.current = stream;

      setCameraOpen(true);

      /*
       * Give React time to render the video element
       * before assigning the stream.
       */
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);

    } catch (error) {
      console.error("Camera error:", error);

      setCameraError(
        "Unable to access your camera. Please check your browser permissions."
      );
    }
  };


  /* =========================
     CAPTURE PHOTO
  ========================== */

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    context.drawImage(
      video,
      0,
      0,
      width,
      height
    );

    const capturedImage =
      canvas.toDataURL("image/jpeg", 0.9);

    setImage(capturedImage);

    closeCamera();
  };


  /* =========================
     CLOSE CAMERA
  ========================== */

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    setCameraOpen(false);
  };


  /* =========================
     CONTINUE
  ========================== */

  const handleContinue = () => {
    if (!image) {
      setCameraError(
        "Please upload a photo or take a photo before continuing."
      );
      return;
    }

    navigate("/skin-analysis/result", {
      state: {
        image,
      },
    });
  };


  /* =========================
     CLEAN CAMERA ON EXIT
  ========================== */

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);


  return (
    <main className="analysis-page skin-analysis-page">

      {/* =====================================
          TOP PROGRESS
      ====================================== */}

      


      {/* =====================================
          MAIN CONTENT
      ====================================== */}

      <section className="analysis-main">

        <div className="analysis-intro">

          <p className="eyebrow">
            STYLAURA • SKIN ANALYSIS
          </p>

          <h1>
            Discover your
            <br />
            <em>skin profile.</em>
          </h1>

          <p className="analysis-description">
            Upload a clear photo or use your camera
            to begin your personalized skin analysis.
          </p>

        </div>


        {/* =====================================
            UPLOAD / CAMERA AREA
        ====================================== */}

        <div className="skin-analysis-workspace">

          {/* LEFT SIDE */}
          <div className="analysis-options">

            <div className="analysis-option-card">

              <div className="option-icon">
                ↑
              </div>

              <div className="option-content">

                <p className="option-number">
                  OPTION 01
                </p>

                <h2>
                  Upload a Photo
                </h2>

                <p>
                  Choose a clear, well-lit photo
                  from your device.
                </p>

              </div>

              <label className="upload-button">
                Choose Photo

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>

            </div>


            <div className="analysis-divider">
              <span />
              <p>OR</p>
              <span />
            </div>


            <div className="analysis-option-card">

              <div className="option-icon">
                ◉
              </div>

              <div className="option-content">

                <p className="option-number">
                  OPTION 02
                </p>

                <h2>
                  Use Camera
                </h2>

                <p>
                  Take a photo directly using
                  your device camera.
                </p>

              </div>

              <button
                type="button"
                className="camera-button"
                onClick={openCamera}
              >
                Open Camera
              </button>

            </div>

          </div>


          {/* RIGHT SIDE */}
          <div className="analysis-preview">

            {!image && !cameraOpen && (
              <div className="preview-empty">

                <div className="preview-symbol">
                  ✦
                </div>

                <h3>
                  Your photo
                  <br />
                  will appear here.
                </h3>

                <p>
                  For the best analysis,
                  use a clear photo in
                  natural lighting.
                </p>

              </div>
            )}


            {cameraOpen && (
              <div className="camera-view">

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                />

                <div className="camera-controls">

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={closeCamera}
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
                  alt="Skin analysis preview"
                />

                <div className="preview-overlay">

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setImage(null)}
                  >
                    Choose Another
                  </button>

                </div>

              </div>
            )}

          </div>

        </div>


        {/* =====================================
            ERROR
        ====================================== */}

        {cameraError && (
          <div className="analysis-error">
            {cameraError}
          </div>
        )}


        {/* =====================================
            CONTINUE
        ====================================== */}

        <div className="analysis-bottom">

          <p>
            Your photo is used to create
            your personalized beauty profile.
          </p>

          <button
            type="button"
            className="analysis-continue"
            onClick={handleContinue}
            disabled={!image}
          >
            Continue to Analysis
            <span>→</span>
          </button>

        </div>

      </section>


      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
      />

    </main>
  );
}

export default SkinAnalysis;