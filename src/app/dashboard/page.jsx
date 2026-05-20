"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../../components/layout/Navbar";
import { useAuth } from "../../lib/useAuth";
import { apiGetStudents, apiAttendance } from "../../lib/api";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [stats, setStats]   = useState({ students: 0, todayCheckIns: 0, rate: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    Promise.all([apiGetStudents(), apiAttendance({ date: today })]).then(([students, todayRecs]) => {
      setStats({
        students: students.length,
        todayCheckIns: todayRecs.length,
        rate: students.length > 0 ? Math.round((todayRecs.length / students.length) * 100) : 0,
      });
      setRecent(todayRecs.slice(0, 5));
    });
  }, [user]);

  if (loading) return <Loading />;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        <div className="animate-fade-up">
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", margin: 0 }}>
              Dashboard
            </h1>
            <p style={{ color: "var(--text-2)", marginTop: 6, fontSize: 14 }}>
              Attendance overview · {today}
            </p>
          </div>

          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
            <StatCard label="Registered Students" value={stats.students}      icon="👤" color="#4c3de3" bg="#ece9fd" />
            <StatCard label="Today's Check-ins"   value={stats.todayCheckIns} icon="✓"  color="#0f9b6e" bg="#e6f7f2" />
            <StatCard label="Attendance Rate"      value={`${stats.rate}%`}    icon="◉"  color="#d97706" bg="#fef3c7" />
          </div>

          {/* CTA */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0f9b6e", marginBottom: 10 }}>
                🎓 Search Attendance by Class
              </div>
              <p style={{ fontSize: 14, color: "var(--text-2)", margin: "0 0 18px" }}>
                Select year level, department, and subject to view matching attendance records.
              </p>
              <Link href="/lecturer" className="btn" style={{ background: "#0f9b6e", color: "#fff" }}>
                Open Class Search →
              </Link>
            </div>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", marginBottom: 10 }}>
                ≡ Student Records
              </div>
              <p style={{ fontSize: 14, color: "var(--text-2)", margin: "0 0 18px" }}>
                View all registered students and their full attendance history.
              </p>
              <Link href="/records" className="btn btn-outline-accent">View Records →</Link>
            </div>
          </div>

          {/* Recent */}
          {recent.length > 0 && (
            <div className="card animate-fade-up delay-200" style={{ overflow: "hidden" }}>
              <div style={{ padding: "18px 20px 0", fontWeight: 600, fontSize: 15 }}>
                Today&apos;s Recent Check-ins
              </div>
              <table className="table" style={{ marginTop: 10 }}>
                <thead>
                  <tr>
                    <th>Student</th><th>Student ID</th><th>Class</th><th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => (
                    <tr key={r._id}>
                      <td style={{ fontWeight: 500 }}>{r.studentName}</td>
                      <td className="mono" style={{ color: "var(--text-2)", fontSize: 12 }}>{r.studentId}</td>
                      <td>{r.className}</td>
                      <td style={{ color: "var(--text-2)" }}>
                        {new Date(r.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function StatCard({ label, value, icon, color, bg }) {
  return (
    <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: bg, color, fontSize: 20,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--text-2)" }}>Loading…</p>
    </div>
  );
}
