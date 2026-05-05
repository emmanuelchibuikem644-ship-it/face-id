"use client";
import { useEffect, useRef, useState } from "react";
import SuccessModal from "../Component/SuccessfulModal";
import Navbar from "../Component/Navbar";

export default function Page() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [active, setActive] = useState(false);
  const [aligned, setAligned] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // start camera
  useEffect(() => {
    if (!active) return;

    const startCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    };

    startCamera();
  }, [active]);

  // mediapipe detection (CDN)
  useEffect(() => {
    if (!active) return;

    const loadScript = (src) =>
      new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        document.body.appendChild(script);
      });

    const init = async () => {
      await loadScript(
        "https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/face_detection.js"
      );

      const faceDetection = new window.FaceDetection({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
      });

      faceDetection.setOptions({
        model: "short",
        minDetectionConfidence: 0.7,
      });

      faceDetection.onResults((results) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        ctx.beginPath();
        ctx.arc(centerX, centerY, 100, 0, 2 * Math.PI);

        if (results.detections.length > 0) {
          const box = results.detections[0].boundingBox;

          const faceCenterX = box.xCenter * canvas.width;
          const faceCenterY = box.yCenter * canvas.height;

          const distance = Math.sqrt(
            (faceCenterX - centerX) ** 2 +
              (faceCenterY - centerY) ** 2
          );

          if (distance < 80) {
            ctx.strokeStyle = "green";
            setAligned(true);
          } else {
            ctx.strokeStyle = "#49cf44";
            setAligned(false);
          }
        } else {
          ctx.strokeStyle = "#88f65c";
          setAligned(false);
        }

        ctx.lineWidth = 3;
        ctx.setLineDash([6]);
        ctx.stroke();
      });

      setInterval(async () => {
        await faceDetection.send({ image: videoRef.current });
      }, 300);
    };

    init();
  }, [active]);

  // capture
  const captureFace = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);

    const image = canvas.toDataURL("image/png");

    await fetch("/api/attendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image,
        name: "Test User",
        studentId: "12345",
        class: "Computer Science",
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      }),
    });

    setModalOpen(true);
  };

  return (
    <div>
      <Navbar />

      <main className="min-h-screen bg-gray-100 p-6 text-black">
        <h1 className="text-2xl font-bold">Check In</h1>
        <p className="text-gray-600">
          Scan your face to mark attendance automatically.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          
          {/* LEFT PANEL */}
          <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-lg">Face Scanner</h2>
            <p className="text-sm text-gray-500 mb-4">
              Look at the camera and click "Capture Face" to check in.
            </p>

            {/* CAMERA */}
            <div className="flex flex-col items-center">
              <div className="relative w-[320px] h-[240px] rounded-xl overflow-hidden shadow-md">
                {!active ? (
                  <div className="flex items-center justify-center h-full bg-black text-white">
                    Camera not active
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      className="w-full h-full object-cover"
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute top-0 left-0 w-full h-full"
                    />
                  </>
                )}
              </div>

              {/* BUTTON */}
              <button
                onClick={() => {
                  if (!active) setActive(true);
                  else captureFace();
                }}
                disabled={active && !aligned}
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                📷 Capture Face
              </button>

              {aligned && (
                <p className="text-green-600 mt-2 text-sm">
                  Perfect position
                </p>
              )}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
            <h3 className="font-semibold">Today (0)</h3>
            <p className="text-gray-400 mt-4 text-sm">
              No check-ins yet today.
            </p>
          </div>
        </div>

        <SuccessModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </main>
    </div>
  );
}