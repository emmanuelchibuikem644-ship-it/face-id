"use client";

import { useEffect, useRef } from "react";

export default function FaceScanner() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let stream;
    let faceDetection;

    const loadScripts = async () => {
      // Load MediaPipe script dynamically
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/face_detection.js";
      script.async = true;

      script.onload = init;
      document.body.appendChild(script);
    };

    const init = async () => {
      // Start Camera
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      // Use global MediaPipe
      faceDetection = new window.FaceDetection({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
      });

      faceDetection.setOptions({
        model: "short",
        minDetectionConfidence: 0.5,
      });

      faceDetection.onResults((results) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (results.detections) {
          results.detections.forEach((detection) => {
            const box = detection.boundingBox;

            ctx.strokeStyle = "#00FF00";
            ctx.lineWidth = 2;

            ctx.strokeRect(
              box.xCenter * canvas.width - (box.width * canvas.width) / 2,
              box.yCenter * canvas.height - (box.height * canvas.height) / 2,
              box.width * canvas.width,
              box.height * canvas.height
            );
          });
        }
      });

      const detect = async () => {
        if (videoRef.current.readyState === 4) {
          await faceDetection.send({ image: videoRef.current });
        }
        requestAnimationFrame(detect);
      };

      detect();
    };

    loadScripts();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="relative w-full max-w-lg">
      <video
        ref={videoRef}
        className="rounded-xl w-full"
        autoPlay
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
      />
    </div>
  );
}