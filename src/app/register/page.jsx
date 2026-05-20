"use client";
import { useState, useRef, useCallback } from "react";
import { loadModels, getFaceDescriptor } from "../../lib/faceApi";
import { apiRegisterStudent } from "../../lib/api";

export default function RegisterPage() {
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const streamRef  = useRef(null);

  const [form, setForm]   = useState({ fullName: "", studentId: "", className: "" });
  const [status, setStatus] = useState("idle"); // idle|loading_models|ready|capturing|success|error
  const [message, setMessage]     = useState("");
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [cameraActive, setCameraActive]   = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const startCamera = useCallback(async () => {
    setStatus("loading_models");
    setMessage("Loading AI face detection models…");
    try {
      await loadModels();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setStatus("ready");
      setMessage("Position your face in the oval and click Capture.");
    } catch {
      setStatus("error");
      setMessage("Could not access camera or load models. Please allow camera access.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCameraActive(false);
    setStatus("idle");
    setMessage("");
  }, []);

  const captureAndRegister = useCallback(async () => {
    if (!form.fullName || !form.studentId || !form.className) {
      setMessage("Please fill in all student details first.");
      return;
    }
    if (!videoRef.current || !canvasRef.current) return;

    setStatus("capturing");
    setMessage("Detecting face…");

    const descriptor = await getFaceDescriptor(videoRef.current);
    if (!descriptor) {
      setMessage("No face detected. Look directly at the camera and try again.");
      setStatus("ready");
      return;
    }

    // Capture photo
    const canvas = canvasRef.current;
    canvas.width  = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    const photoUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedPhoto(photoUrl);

    setMessage("Saving to database…");

    // ── Save to MongoDB via backend ─────────────────────────────────────────
    const result = await apiRegisterStudent({
      fullName:       form.fullName,
      studentId:      form.studentId,
      className:      form.className,
      faceDescriptor: Array.from(descriptor),
      photoUrl,
    });

    if (result.error) {
      setMessage(`Error: ${result.error}`);
      setStatus("error");
      return;
    }

    stopCamera();
    setStatus("success");
    setMessage(`${form.fullName} registered successfully!`);
    setForm({ fullName: "", studentId: "", className: "" });
    setCapturedPhoto(photoUrl);
  }, [form, stopCamera]);

  return (
    <div className="animate-fade-up">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", margin: 0 }}>
          Register Student
        </h1>
        <p style={{ color: "var(--text-2)", marginTop: 6, fontSize: 14 }}>
          Fill in your details and capture your face for recognition.
        </p>
      </div>

      {status === "success" && (
        <div
          className="animate-fade-in"
          style={{
            marginBottom: 20, padding: "14px 18px",
            borderRadius: 10, background: "var(--success-light)",
            color: "var(--success)", fontWeight: 600, fontSize: 14,
            display: "flex", alignItems: "center", gap: 10,
          }}
        >
          <span style={{ fontSize: 18 }}>✓</span> {message}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Form */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
            <span style={{ color: "var(--accent)", fontSize: 17 }}>✦</span>
            <span style={{ fontWeight: 700, fontSize: 16 }}>Student Details</span>
          </div>
          <p style={{ color: "var(--text-2)", fontSize: 13, marginBottom: 24 }}>
            Enter your information below.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Full Name">
              <input className="input" name="fullName" placeholder="e.g. Ada Okonkwo"
                value={form.fullName} onChange={handleChange} />
            </Field>
            <Field label="Student ID">
              <input className="input mono" name="studentId" placeholder="e.g. CSC/2022/001"
                value={form.studentId} onChange={handleChange} />
            </Field>
            <Field label="Department / Class">
              <input className="input" name="className"
                placeholder="e.g. Computer Science 300L"
                value={form.className} onChange={handleChange} />
              <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 5 }}>
                Include department name and year level, e.g. "Engineering 200L"
              </p>
            </Field>

            {!cameraActive ? (
              <button
                className="btn btn-primary"
                style={{ marginTop: 8, justifyContent: "center" }}
                onClick={startCamera}
                disabled={status === "loading_models"}
              >
                {status === "loading_models" ? <><Spinner /> Loading AI Models…</> : <>◉ Activate Camera</>}
              </button>
            ) : (
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={captureAndRegister}
                  disabled={status === "capturing"}
                >
                  {status === "capturing" ? <><Spinner /> Saving…</> : <>📷 Capture & Register</>}
                </button>
                <button className="btn btn-secondary" onClick={stopCamera}>✕</button>
              </div>
            )}

            {message && status !== "success" && (
              <p style={{
                fontSize: 13, margin: 0,
                color: status === "error" ? "var(--danger)" : "var(--text-2)",
              }}>
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Camera / preview */}
        <div className="card" style={{ padding: 28, display: "flex", flexDirection: "column" }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Face Capture</div>
          <p style={{ color: "var(--text-2)", fontSize: 13, marginBottom: 20 }}>
            Position your face within the oval guide.
          </p>

          <div style={{
            flex: 1, minHeight: 300,
            background: "var(--surface-2)", borderRadius: 12,
            position: "relative", overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <video
              ref={videoRef}
              autoPlay playsInline muted
              style={{
                width: "100%", height: "100%", objectFit: "cover",
                display: cameraActive ? "block" : "none",
                transform: "scaleX(-1)",
              }}
            />
            {cameraActive && <><div className="face-oval" /><div className="scan-line" /></>}

            {!cameraActive && capturedPhoto && status === "success" && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={capturedPhoto} alt="Captured face"
                style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} />
            )}

            {!cameraActive && !capturedPhoto && (
              <div style={{ textAlign: "center", color: "var(--text-3)" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>◉</div>
                <p style={{ fontSize: 13 }}>Load AI models first,<br />then the camera will activate.</p>
              </div>
            )}

            {status === "success" && capturedPhoto && (
              <div style={{
                position: "absolute", inset: 0,
                background: "rgba(15,155,110,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{
                  width: 60, height: 60, borderRadius: "50%",
                  background: "var(--success)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 28,
                }}>✓</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <span style={{
      display: "inline-block", width: 14, height: 14,
      border: "2px solid rgba(255,255,255,0.4)",
      borderTopColor: "#fff", borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
    }} />
  );
}
