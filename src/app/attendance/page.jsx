"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../../components/layout/Navbar";
import { useAuth } from "../../lib/useAuth";
import { apiAttendance } from "../../lib/api";

function AttendancePage() {
  const router  = useRouter();
  const params  = useSearchParams();
  const { user, loading } = useAuth();

  const year       = params.get("year")       || "";
  const department = params.get("department") || "";
  const subject    = params.get("subject")    || "";

  const [records,     setRecords]     = useState([]);
  const [dateFilter,  setDateFilter]  = useState("");
  const [search,      setSearch]      = useState("");
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    apiAttendance({ year, department }).then((recs) => {
      setRecords(recs);
      setDataLoading(false);
    });
  }, [user, year, department]);

  const filtered = records.filter((r) => {
    const matchSearch = !search ||
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.studentId.toLowerCase().includes(search.toLowerCase());
    const matchDate = !dateFilter || r.date === dateFilter;
    return matchSearch && matchDate;
  });

  const byDate = filtered.reduce((acc, r) => {
    if (!acc[r.date]) acc[r.date] = [];
    acc[r.date].push(r);
    return acc;
  }, {});
  const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  const formatDate = (d) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

  if (loading) return <><Navbar /><div style={{ padding: 60, textAlign: "center" }}>Loading…</div></>;

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        <div className="animate-fade-up">
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <button
              onClick={() => router.push("/lecturer")}
              style={{
                marginBottom: 16, padding: "7px 16px", borderRadius: 8,
                border: "1.5px solid var(--border)", background: "var(--surface-2)",
                fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >← Back to Class Search</button>

            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", margin: 0 }}>
              Attendance Records
            </h1>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              <Chip label={`Year ${year}`}  color="var(--accent)" bg="var(--accent-light)" />
              <Chip label={department}       color="#0f9b6e"       bg="#e6f7f2" />
              <Chip label={subject}          color="#d97706"       bg="#fef3c7" />
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <input className="input" style={{ maxWidth: 280 }}
              placeholder="Search by name or ID…"
              value={search} onChange={(e) => setSearch(e.target.value)} />
            <input className="input" type="date" style={{ maxWidth: 180 }}
              value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
            {(search || dateFilter) && (
              <button
                onClick={() => { setSearch(""); setDateFilter(""); }}
                style={{
                  padding: "10px 16px", borderRadius: 8,
                  border: "1.5px solid var(--border)", background: "var(--surface-2)",
                  fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >✕ Clear</button>
            )}
            <div style={{ marginLeft: "auto", color: "var(--text-2)", fontSize: 14, display: "flex", alignItems: "center" }}>
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Results */}
          {dataLoading ? (
            <div style={{ textAlign: "center", padding: 60, color: "var(--text-3)" }}>Loading records…</div>
          ) : filtered.length === 0 ? (
            <div className="card" style={{ padding: 60, textAlign: "center", color: "var(--text-3)" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
              <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No attendance records found</p>
              <p style={{ fontSize: 13 }}>
                {records.length === 0
                  ? "No students from this department/year have checked in yet."
                  : "Try adjusting your search or date filter."}
              </p>
              <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 12 }}>
                Tip: The class name entered during student registration must include the department and year level,
                e.g. &quot;Computer Science 300L&quot;.
              </p>
            </div>
          ) : (
            dates.map((date) => (
              <div key={date} style={{ marginBottom: 24 }}>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: "var(--text-2)",
                  textTransform: "uppercase", letterSpacing: "0.06em",
                  marginBottom: 10, display: "flex", alignItems: "center", gap: 10,
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#0f9b6e", display: "inline-block" }} />
                  {formatDate(date)}
                  <span style={{
                    fontSize: 11, background: "var(--surface-2)",
                    padding: "2px 8px", borderRadius: 99, fontWeight: 600,
                  }}>
                    {byDate[date].length} present
                  </span>
                </div>

                <div className="card" style={{ overflow: "hidden" }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Student ID</th>
                        <th>Department / Class</th>
                        <th>Date</th>
                        <th>Time Registered</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {byDate[date].map((r) => (
                        <tr key={r._id}>
                          <td style={{ fontWeight: 600 }}>{r.studentName}</td>
                          <td className="mono" style={{ fontSize: 12, color: "var(--text-2)" }}>
                            {r.studentId}
                          </td>
                          <td style={{ color: "var(--text-2)", fontSize: 13 }}>{r.className}</td>
                          <td style={{ fontSize: 13, color: "var(--text-2)" }}>
                            {new Date(r.date + "T00:00:00").toLocaleDateString("en-GB", {
                              day: "2-digit", month: "short", year: "numeric",
                            })}
                          </td>
                          <td style={{ fontSize: 13, color: "var(--text-2)" }}>
                            {new Date(r.createdAt).toLocaleTimeString([], {
                              hour: "2-digit", minute: "2-digit", second: "2-digit",
                            })}
                          </td>
                          <td><span className="badge badge-success">✓ Present</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </>
  );
}

function Chip({ label, color, bg }) {
  return (
    <span style={{ padding: "4px 12px", borderRadius: 99, background: bg, color, fontSize: 13, fontWeight: 600 }}>
      {label}
    </span>
  );
}

export default function AttendancePageWrapper() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: "center" }}>Loading…</div>}>
      <AttendancePage />
    </Suspense>
  );
}
