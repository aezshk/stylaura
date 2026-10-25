import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function HairAnalysis() {
  const navigate = useNavigate();

  const [hairType, setHairType] = useState("");
  const [concern, setConcern] = useState("");
  const [image, setImage] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const hairTypes = [
    "Straight",
    "Wavy",
    "Curly",
    "Coily",
  ];

  const concerns = [
    "Dryness",
    "Frizz",
    "Hair Fall",
    "Damage",
    "Dandruff",
    "Lack of Volume",
  ];

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

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    setCameraOpen(false);
  };

  const handleContinue = () => {
    if (!hairType || !concern) {
      return;
    }

    if (!image) {
      setCameraError(
        "Please upload a hair photo or take a photo before continuing."
      );
      return;
    }

    navigate("/hair-analysis/result", {
      state: {
        hairType,
        concern,
        image,
      },
    });
  };

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
    <main className="analysis-page hair-analysis-page">

      <section className="hair-analysis-main">

        {/* INTRO */}

        <div className="analysis-intro">

          <p className="eyebrow">
            STYLAURA • HAIR ANALYSIS
          </p>

          <h1>
            Understand your
            <br />
            <em>hair needs.</em>
          </h1>

          <p className="analysis-description">
            Tell us about your hair and add a clear
            photo to receive more personalized
            haircare recommendations.
          </p>

        </div>


        {/* PHOTO */}

        <div className="hair-photo-section">

          <div className="hair-photo-heading">

            <div>
              <p className="question-label">
                PHOTO
              </p>

              <h2>
                Show us your hair.
              </h2>

              <p>
                A clear photo helps create a more
                personalized starting point.
              </p>
            </div>

            {image && (
              <button
                type="button"
                className="photo-remove"
                onClick={() => setImage(null)}
              >
                Remove photo
              </button>
            )}

          </div>


          <div className="hair-photo-workspace">

            <div className="hair-photo-preview">

              {!image && !cameraOpen && (
                <div className="hair-photo-empty">

                  <span>
                    ✦
                  </span>

                  <h3>
                    Add a clear
                    <br />
                    hair photo.
                  </h3>

                  <p>
                    Natural lighting works best.
                  </p>

                </div>
              )}


              {cameraOpen && (
                <div className="hair-camera-view">

                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                  />

                  <div className="hair-camera-controls">

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
                <div className="hair-image-preview">

                  <img
                    src={image}
                    alt="Hair analysis preview"
                  />

                </div>
              )}

            </div>


            {!cameraOpen && (
              <div className="hair-photo-actions">

                <label className="upload-button">

                  Upload Photo

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />

                </label>

                <button
                  type="button"
                  className="camera-button"
                  onClick={openCamera}
                >
                  Use Camera
                </button>

              </div>
            )}

          </div>

        </div>


        {/* QUESTIONS */}

        <div className="hair-analysis-layout">

          <div className="hair-form-card">

            {/* HAIR TYPE */}

            <div className="hair-question">

              <div className="question-heading">

                <span className="question-number">
                  01
                </span>

                <div>

                  <p className="question-label">
                    HAIR TYPE
                  </p>

                  <h2>
                    What is your hair type?
                  </h2>

                </div>

              </div>


              <div className="hair-options">

                {hairTypes.map((type) => (

                  <button
                    key={type}
                    type="button"
                    className={
                      hairType === type
                        ? "hair-option selected"
                        : "hair-option"
                    }
                    onClick={() => setHairType(type)}
                  >

                    <span>
                      {type}
                    </span>

                    {hairType === type && (
                      <span className="option-check">
                        ✓
                      </span>
                    )}

                  </button>

                ))}

              </div>

            </div>


            <div className="question-separator" />


            {/* CONCERN */}

            <div className="hair-question">

              <div className="question-heading">

                <span className="question-number">
                  02
                </span>

                <div>

                  <p className="question-label">
                    HAIR CONCERN
                  </p>

                  <h2>
                    What would you like to improve?
                  </h2>

                </div>

              </div>


              <div className="hair-options concern-options">

                {concerns.map((item) => (

                  <button
                    key={item}
                    type="button"
                    className={
                      concern === item
                        ? "hair-option selected"
                        : "hair-option"
                    }
                    onClick={() => setConcern(item)}
                  >

                    <span>
                      {item}
                    </span>

                    {concern === item && (
                      <span className="option-check">
                        ✓
                      </span>
                    )}

                  </button>

                ))}

              </div>

            </div>

          </div>


          {/* PROFILE SUMMARY */}

          <aside className="hair-side-card">

            <div className="side-symbol">
              ✦
            </div>

            <p className="side-label">
              YOUR HAIR PROFILE
            </p>

            <h3>
              Small details
              <br />
              create the
              <br />
              <em>right routine.</em>
            </h3>

            <p>
              Your photo and answers help
              STYLAURA understand your hair
              and create more relevant
              recommendations.
            </p>


            <div className="profile-summary">

              <div>

                <span>
                  Photo
                </span>

                <strong>
                  {image ? "Added" : "Not added"}
                </strong>

              </div>


              <div>

                <span>
                  Hair type
                </span>

                <strong>
                  {hairType || "Not selected"}
                </strong>

              </div>


              <div>

                <span>
                  Main concern
                </span>

                <strong>
                  {concern || "Not selected"}
                </strong>

              </div>

            </div>

          </aside>

        </div>


        {cameraError && (
          <div className="analysis-error">
            {cameraError}
          </div>
        )}


        {/* BOTTOM */}

        <div className="analysis-bottom">

          <p>
            Add your photo and select your hair
            details before continuing.
          </p>

          <button
            type="button"
            className="analysis-continue"
            disabled={
              !hairType ||
              !concern ||
              !image
            }
            onClick={handleContinue}
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

export default HairAnalysis;