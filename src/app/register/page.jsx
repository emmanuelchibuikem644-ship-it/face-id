"use client";


import { useState } from "react";
import Navbar from "../Component/Navbar";
import FaceScanner from "../Component/FaceScanner";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    matric: "",
    department: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Student Data:", form);
    // later → send to backend
  };

  return (
    <div>
      <Navbar />

      <div className="p-6 grid grid-cols-2 gap-6">
        {/* FORM */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            Register New Student
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="w-full border rounded-lg p-3 outline-none"
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="matric"
              placeholder="Matric Number"
              className="w-full border rounded-lg p-3 outline-none"
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="department"
              placeholder="Department"
              className="w-full border rounded-lg p-3 outline-none"
              onChange={handleChange}
              required
            />

            <button className="w-full bg-purple-600 text-white py-3 rounded-lg">
              Register Student
            </button>
          </form>
        </div>

        {/* CAMERA */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            Capture Face
          </h2>

          <FaceScanner />
        </div>
      </div>
    </div>
  );
}