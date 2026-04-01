"use client";
import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import SuccessModal from "../Component/SuccessfulModal";
import Navbar from "../Component/Navbar";

export default function Page() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [active, setActive] = useState(false);
  const [aligned, setAligned] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      faceapi.nets.tinyFaceDetector.loadFromUri("/models");
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    if (!videoRef.current) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    startCamera();
  }, [active]);

  useEffect(() => {
    if (!active || !videoRef.current) return;

    const interval = setInterval(async () => {
      if (!videoRef.current) return;

      const detection = await faceapi.detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      );

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 100;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);

      if (detection) {
        const box = detection.box;
        const faceCenterX = box.x + box.width / 2;
        const faceCenterY = box.y + box.height / 2;

        const distance = Math.sqrt(
          (faceCenterX - centerX) ** 2 + (faceCenterY - centerY) ** 2
        );

        if (distance < 80) {
          ctx.strokeStyle = "green";
          setAligned(true);

          if (!modalOpen) setModalOpen(true);
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
    }, 200);

    return () => clearInterval(interval);
  }, [active, modalOpen]);

  return (
    <div>
      <Navbar />
      <main className="min-h-screen bg-gray-100 p-4 sm:p-6 text-black">
        
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
          Check In
        </h1>
        <p className="text-sm sm:text-base">
          Scan your face to mark attendance automatically.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-6">
          
          {/* LEFT */}
          <div className="md:col-span-2 bg-white rounded-2xl p-4 sm:p-6">
            <h2 className="font-semibold mb-4 text-lg sm:text-xl">
              Face Scanner
            </h2>

            <div className="relative w-full h-[250px] sm:h-[300px] md:h-[400px] bg-black rounded-xl overflow-hidden">
              {!active ? (
                <div className="flex items-center justify-center h-full text-white text-sm sm:text-base text-center px-2">
                  Camera not active
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover transform scale-x-[-1]"
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  />
                </>
              )}
            </div>

            <button
              onClick={() => setActive(true)}
              className="mt-4 w-full sm:w-auto bg-purple-600 text-white px-6 py-2 rounded-lg"
            >
              Activate Scanner
            </button>

            {aligned && (
              <p className="text-green-600 mt-2 font-medium text-sm sm:text-base">
                Perfect position
              </p>
            )}
          </div>

          {/* RIGHT */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 flex items-center justify-center text-center">
            <p className="text-sm sm:text-base">
              No check-ins yet
            </p>
          </div>
        </div>

        <SuccessModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </main>
    </div>
  );
}