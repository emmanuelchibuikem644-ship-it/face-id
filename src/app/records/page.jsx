"use client";

import { useState } from "react";

export default function RecordsPage() {
  const [records, setRecords] = useState([
    // Example data (you can remove later)
    {
      name: "John Doe",
      date: "2026-03-31",
      time: "10:32 AM",
    },
    {
      name: "Jane Smith",
      date: "2026-03-31",
      time: "10:45 AM",
    },
  ]);

  return (
    <main className="min-h-screen bg-gray-100 p-6 text-black">
      {/* Header */}
      <h1 className="text-2xl font-bold">Attendance Records</h1>
      <p className="mt-1">
        View all attendance history across all classes.
      </p>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
        
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">
            All Records ({records.length})
          </h2>

          <input
            type="text"
            placeholder="Search by name or class..."
            className="border px-3 py-2 rounded-lg text-sm"
          />
        </div>

        {/* Table */}
        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p>No attendance records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 border">Student</th>
                  <th className="text-left p-3 border">Date</th>
                  <th className="text-left p-3 border">Time</th>
                  <th className="text-left p-3 border">Status</th>
                </tr>
              </thead>

              <tbody>
                {records.map((rec, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-3 border">{rec.name}</td>
                    <td className="p-3 border">{rec.date}</td>
                    <td className="p-3 border">{rec.time}</td>
                    <td className="p-3 border">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                        Present
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}