 "use client";
import Navbar from "./Component/Navbar";
import { useRouter } from "next/navigation";
import * as faceapi from "face-api.js";
import React, { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Function to load face-api models
  const loadModels = async () => {
    setLoading(true);
    const MODEL_URL = "/models"; // keep your public/models folder
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    setLoading(false);
    alert("Models loaded successfully!"); // optional feedback
    router.push("/checkin"); // go to camera page
  };

  return (
    <div>
      <Navbar />
      <main className="bg-gray-300 h-full flex-1 p-6">
        <div className="text-black p-6">
          <h1 className="text-2xl font-bold mb-4">Register student</h1>
          <p className="text-gray-700 mb-4">
            Fill in student details and capture their face for recognition.
          </p>

          <div className="p-4 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* YOUR FORM REMAINS EXACTLY AS YOU WROTE IT */}
            <form className="space-y-8 bg-white p-6 rounded-lg shadow-sm">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter student name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Student ID
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter student ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Class
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter class e.g., computer science 202"
                />
              </div>

              {/* THIS BUTTON NOW LOADS THE MODELS */}
              <div>
                <button
                  type="button" // must be button, not submit
                  onClick={loadModels}
                  className="w-full px-4 py-2 bg-white text-black rounded-md hover:bg-green-400 shadow-sm transition-colors"
                >
                  {loading ? "Loading..." : "Load Face Detection Model"}
                </button>
              </div>
            </form>

            {/* YOUR FACE CAPTURE BOX REMAINS EXACTLY AS YOU WROTE IT */}
            <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Face Capture</h2>
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-md">
                <span className="text-gray-500">
                  Load the AI models first, then the camera will activate.
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}