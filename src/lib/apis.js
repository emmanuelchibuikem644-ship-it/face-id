// lib/api.js  — lecturer-app backend calls
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function token() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("fc_lecturer_token") || "";
}

function headers() {
  return { "Content-Type": "application/json", "x-session-token": token() };
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function apiLogin(email, password) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data.token) localStorage.setItem("fc_lecturer_token", data.token);
  return data;
}

export async function apiLogout() {
  await fetch(`${BASE}/api/auth/logout`, { method: "POST", headers: headers() });
  localStorage.removeItem("fc_lecturer_token");
}

export async function apiMe() {
  try {
    const res = await fetch(`${BASE}/api/auth/me`, { headers: headers() });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

// ── Year levels ───────────────────────────────────────────────────────────────

export async function apiYearLevels() {
  const res = await fetch(`${BASE}/api/year-levels`, { headers: headers() });
  return res.ok ? res.json() : [];
}

// ── Departments ───────────────────────────────────────────────────────────────

export async function apiDepartments() {
  const res = await fetch(`${BASE}/api/departments`, { headers: headers() });
  return res.ok ? res.json() : [];
}

export async function apiAddDepartment(name) {
  const res = await fetch(`${BASE}/api/departments`, {
    method: "POST", headers: headers(), body: JSON.stringify({ name }),
  });
  return res.json();
}

export async function apiDeleteDepartment(name) {
  const res = await fetch(`${BASE}/api/departments/${encodeURIComponent(name)}`, {
    method: "DELETE", headers: headers(),
  });
  return res.json();
}

export async function apiSubjects(department) {
  const res = await fetch(`${BASE}/api/departments/${encodeURIComponent(department)}/subjects`, {
    headers: headers(),
  });
  return res.ok ? res.json() : [];
}

// ── Attendance ─────────────────────────────────────────────────────────────────

export async function apiAttendance({ year, department, date } = {}) {
  const params = new URLSearchParams();
  if (year)       params.set("year", year);
  if (department) params.set("department", department);
  if (date)       params.set("date", date);

  const res = await fetch(`${BASE}/api/attendance?${params.toString()}`, {
    headers: headers(),
  });
  return res.ok ? res.json() : [];
}

// ── Students (for records page) ───────────────────────────────────────────────

export async function apiGetStudents() {
  const res = await fetch(`${BASE}/api/students`, { headers: headers() });
  return res.ok ? res.json() : [];
}

export async function apiDeleteStudent(id) {
  const res = await fetch(`${BASE}/api/students/${id}`, {
    method: "DELETE", headers: headers(),
  });
  return res.json();
}
