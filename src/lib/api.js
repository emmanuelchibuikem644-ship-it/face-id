// lib/api.js  — student-app backend calls
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// ── Students ──────────────────────────────────────────────────────────────────

export async function apiRegisterStudent(studentData) {
  const res = await fetch(`${BASE}/api/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(studentData),
  });
  return res.json();
}

export async function apiGetStudents() {
  const res = await fetch(`${BASE}/api/students`);
  if (!res.ok) return [];
  return res.json();
}

// ── Attendance ─────────────────────────────────────────────────────────────────

export async function apiCheckIn({ studentId, studentName, className, confidence }) {
  const date = new Date().toISOString().split("T")[0];
  const res = await fetch(`${BASE}/api/attendance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId, studentName, className, date, confidence }),
  });
  return res.json();
}

export async function apiTodayRecords() {
  const res = await fetch(`${BASE}/api/attendance/today`);
  if (!res.ok) return [];
  return res.json();
}
