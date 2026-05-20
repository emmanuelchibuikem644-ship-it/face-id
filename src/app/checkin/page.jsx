"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { loadModels, getFaceDescriptor, findBestMatch } from "../../lib/faceApi";
import { apiGetStudents, apiCheckIn, apiTodayRecords } from "../../lib/api";

export default function CheckInPage() {
  const videoRef    = useRef(null);
  const streamRef   = useRef(null);
  const intervalRef = useRef(null);
  const studentsRef = useRef([]); // cache students from DB

  const [status, setStatus]       = useState("idle");
  const [todayRecords, setTodayRecords] = useState([]);
  const [lastMatch, setLastMatch]  = useState(null);
  const [scanMessage, setScanMessage] = useState("");

  useEffect(() => {
    apiTodayRecords().then((r) => setTodayRecords([...r].reverse()));
  }, []);

  const refreshRecords = () =>
    apiTodayRecords().then((r) => setTodayRecords([...r].reverse()));

  const startRecognitionLoop = () => {
    intervalRef.current = setInterval(async () => {
      if (!videoRef.current) return;
      setStatus("scanning");

      const descriptor = await getFaceDescriptor(videoRef.current);
      if (!descriptor) {
        setStatus("no_face");
        setScanMessage("No face detected — look directly at the camera.");
        return;
      }

      const match = findBestMatch(descriptor, studentsRef.current);
      if (!match) {
        setStatus("no_match");
        setScanMessage("Face not recognised. Please register first.");
        return;
      }

      const student = studentsRef.current.find((s) => s.studentId === match.studentId);

      // ── Record check-in in MongoDB ─────────────────────────────────────────
      const result = await apiCheckIn({
        studentId:   student.studentId,
        studentName: student.fullName,
        className:   student.className,
        confidence:  match.distance,
      });

      if (result.alreadyCheckedIn) {
        setStatus("already_in");
        setLastMatch(student);
        setScanMessage(`${student.fullName} already checked in today.`);
        return;
      }

      if (result.error) {
        setScanMessage(`Error: ${result.error}`);
        return;
      }

      setLastMatch(student);
      setStatus("matched");
      setScanMessage(`✓ ${student.fullName} checked in!`);
      refreshRecords();

      clearInterval(intervalRef.current);
      setTimeout(() => {
        if (streamRef.current) {
          setStatus("ready");
          setScanMessage("Look at the camera and hold still…");
          startRecognitionLoop();
        }
      }, 3000);
    }, 2000);
  };

  const startScanner = useCallback(async () => {
    setStatus("loading");
    setScanMessage("Loading AI recognition models…");
    try {
      await loadModels();

      setScanMessage("Fetching registered students from database…");
      studentsRef.current = await apiGetStudents();

      if (studentsRef.current.length === 0) {
        setScanMessage("No students registered yet. Please register first.");
        setStatus("idle");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("ready");
      setScanMessage("Look at the camera and hold still…");
      startRecognitionLoop();
    } catch {
      setStatus("idle");
      setScanMessage("Camera access denied or models failed to load.");
    }
  }, []); // eslint-disable-line

  const stopScanner = useCallback(() => {
    clearInterval(intervalRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setStatus("idle");
    setScanMessage("");
    setLastMatch(null);
  }, []);

  const statusColor = () => {
    if (status === "matched")   return "var(--success)";
    if (status === "already_in") return "var(--warning)";
    if (status === "no_match" || status === "no_face") return "var(--danger)";
    return "var(--accent)";
  };

  const isActive = !["idle", "loading"].includes(status);

  return (
    <div className="animate-fade-up">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", margin: 0 }}>
          Check In
        </h1>
        <p style={{ color: "var(--text-2)", marginTop: 6, fontSize: 14 }}>
          Scan your face to mark attendance automatically.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>
        {/* Scanner panel */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
            <span style={{ color: "var(--accent)", fontSize: 17 }}>◉</span>
            <span style={{ fontWeight: 700, fontSize: 16 }}>Face Scanner</span>
          </div>
          <p style={{ color: "var(--text-2)", fontSize: 13, marginBottom: 20 }}>
            Look at the camera and click &ldquo;Activate Scanner&rdquo; to check in.
          </p>

          {/* Camera viewport */}
          <div style={{
            position: "relative", borderRadius: 14, overflow: "hidden",
            background: "#0f0e15", aspectRatio: "4/3",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <video
              ref={videoRef}
              autoPlay playsInline muted
              style={{
                width: "100%", height: "100%", objectFit: "cover",
                display: isActive ? "block" : "none",
                transform: "scaleX(-1)",
              }}
            />
            {isActive && <div className="face-oval" />}
            {isActive && status !== "matched" && <div className="scan-line" />}

            {(status === "matched" || status === "already_in") && isActive && (
              <div style={{
                position: "absolute", bottom: 16,
                left: "50%", transform: "translateX(-50%)",
                background: status === "matched" ? "var(--success)" : "var(--warning)",
                color: "#fff", padding: "8px 18px",
                borderRadius: 99, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
              }}>
                {scanMessage}
              </div>
            )}

            {!isActive && (
              <div style={{ textAlign: "center", color: "#555" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>◉</div>
                <p style={{ fontSize: 13, color: "#888" }}>
                  Load the AI face recognition models to start scanning.
                </p>
              </div>
            )}
          </div>

          {/* Status bar */}
          {isActive && !["matched","already_in"].includes(status) && (
            <div style={{
              marginTop: 14, padding: "10px 14px",
              borderRadius: 8, background: "var(--surface-2)",
              display: "flex", alignItems: "center", gap: 10, fontSize: 13,
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: statusColor(), flexShrink: 0,
                boxShadow: `0 0 0 3px ${statusColor()}33`,
              }} />
              <span style={{ color: "var(--text-2)" }}>{scanMessage}</span>
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            {!isActive ? (
              <button
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={startScanner}
                disabled={status === "loading"}
              >
                {status === "loading" ? "Loading…" : "◉ Activate Scanner"}
              </button>
            ) : (
              <button
                className="btn btn-secondary"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={stopScanner}
              >
                ✕ Stop Scanner
              </button>
            )}
          </div>

          {lastMatch && status === "matched" && (
            <div className="animate-fade-in" style={{
              marginTop: 16, padding: "14px 16px",
              background: "var(--success-light)", borderRadius: 10,
              border: "1px solid #a7f0d9",
            }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "var(--success)" }}>
                ✓ Attendance Recorded
              </div>
              <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 4 }}>
                <strong>{lastMatch.fullName}</strong> — {lastMatch.className}
              </div>
            </div>
          )}
        </div>

        {/* Today's records */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Today ({todayRecords.length})</div>
          </div>
          {todayRecords.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--text-3)" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>!</div>
              <p style={{ fontSize: 13 }}>No check-ins yet today.</p>
            </div>
          ) : (
            <div style={{ overflowY: "auto", maxHeight: 460 }}>
              {todayRecords.map((r, i) => (
                <div key={r._id || i} style={{
                  padding: "13px 20px", borderBottom: "1px solid var(--surface-2)",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{r.studentName}</div>
                    <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{r.className}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="badge badge-success" style={{ marginBottom: 4 }}>✓ Present</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                      {new Date(r.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
