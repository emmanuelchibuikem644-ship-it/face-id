"use client";


import { useState } from "react";
import Navbar from "../Component/Navbar";
import FaceScanner from "../Component/FaceScanner";
import SuccessModal from "../Component/SuccessfulModal";

export default function CheckInPage() {
  const [scannerOn, setScannerOn] = useState(false);
  const [records, setRecords] = useState([]);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const handleCapture = () => {
    const now = new Date();

    const time = now.toLocaleTimeString();
    const day = now.toLocaleDateString("en-US", {
      weekday: "long",
    });

    const newRecord = {
      id: Date.now(),
      time,
      day,
    };

    // add record
    setRecords((prev) => [newRecord, ...prev]);

    // show success modal
    setIsSuccessOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="p-6 grid grid-cols-3 gap-6">
        {/* LEFT SIDE */}
        <div className="col-span-2 bg-white p-6 rounded-xl border shadow-sm">
          <h1 className="text-2xl font-bold mb-1">Check In</h1>
          <p className="text-gray-500 mb-6">
            Scan your face to mark attendance automatically.
          </p>

          {!scannerOn ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-gray-400 mb-6 text-center">
                Face Scanner is currently OFF
              </div>

              <button
                onClick={() => setScannerOn(true)}
                className="bg-purple-600 text-white px-6 py-3 rounded-xl"
              >
                Activate Scanner
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-5">
              {/* CAMERA */}
              <FaceScanner />

              {/* CAPTURE BUTTON */}
              <button
                onClick={handleCapture}
                className="bg-green-600 text-white px-6 py-3 rounded-xl"
              >
                Capture Face
              </button>
            </div>
          )}   
        </div>

        {/* RIGHT SIDE */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="font-semibold mb-4">
            Today ({records.length})
          </h2>

          {records.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No check-ins yet today.
            </p>
          ) : (
            <div className="space-y-3">
              {records.map((r) => (
                <div
                  key={r.id}
                  className="border rounded-lg p-3 flex justify-between items-center"
                >
                  <span className="font-medium text-gray-700">
                    {r.day}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {r.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SUCCESS MODAL */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
      />
    </div>
  );
}