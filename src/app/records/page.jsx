"use client";
import { useState, useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import { useAuth } from "../../lib/useAuth";
import { apiGetStudents, apiDeleteStudent, apiAttendance } from "../../lib/api";

export default function RecordsPage() {
  const { user, loading } = useAuth();
  const [tab,       setTab]       = useState("students");
  const [students,  setStudents]  = useState([]);
  const [records,   setRecords]   = useState([]);
  const [search,    setSearch]    = useState("");
  const [dateFilter,setDateFilter]= useState("");

  useEffect(() => {
    if (!user) return;
    Promise.all([apiGetStudents(), apiAttendance()]).then(([s, r]) => {
      setStudents(s);
      setRecords(r);
    });
  }, [user]);

  const handleDelete = async (id) => {
    if (!confirm("Remove this student and their data?")) return;
    await apiDeleteStudent(id);
    setStudents((prev) => prev.filter((s) => s._id !== id));
  };

  const filteredStudents = students.filter((s) =>
    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
    s.studentId.toLowerCase().includes(search.toLowerCase()) ||
    s.className.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRecords = records.filter((r) => {
    const matchSearch =
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.studentId.toLowerCase().includes(search.toLowerCase());
    const matchDate = dateFilter ? r.date === dateFilter : true;
    return matchSearch && matchDate;
  });

  if (loading) return <><Navbar /><div style={{ padding: 60, textAlign: "center" }}>Loading…</div></>;

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        <div className="animate-fade-up">
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", margin: 0 }}>Records</h1>
            <p style={{ color: "var(--text-2)", marginTop: 6, fontSize: 14 }}>
              View all registered students and full attendance history from MongoDB.
            </p>
          </div>

          {/* Tabs */}
          <div style={{
            display: "flex", gap: 4, marginBottom: 20,
            background: "var(--surface-2)", padding: 4, borderRadius: 10, width: "fit-content",
          }}>
            {[["students", `👤 Students (${students.length})`], ["attendance", `📋 Attendance (${records.length})`]].map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "8px 20px", borderRadius: 8, border: "none",
                fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer",
                background: tab === t ? "var(--surface)" : "transparent",
                color: tab === t ? "#0f9b6e" : "var(--text-2)",
                boxShadow: tab === t ? "var(--shadow-sm)" : "none",
                transition: "all 0.16s",
              }}>{label}</button>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <input className="input" style={{ maxWidth: 300 }}
              placeholder="Search by name, ID, or class…"
              value={search} onChange={(e) => setSearch(e.target.value)} />
            {tab === "attendance" && (
              <input className="input" type="date" style={{ maxWidth: 180 }}
                value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
            )}
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
          </div>

          {/* Students table */}
          {tab === "students" && (
            <div className="card" style={{ overflow: "hidden" }}>
              {filteredStudents.length === 0 ? (
                <Empty text={search ? "No students match your search." : "No students registered yet."} />
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student</th><th>Student ID</th><th>Department / Class</th>
                      <th>Registered</th><th>Face Data</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s) => (
                      <tr key={s._id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            {s.photoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={s.photoUrl} alt={s.fullName} style={{
                                width: 34, height: 34, borderRadius: "50%",
                                objectFit: "cover", transform: "scaleX(-1)",
                                border: "2px solid var(--border)",
                              }} />
                            ) : (
                              <div style={{
                                width: 34, height: 34, borderRadius: "50%",
                                background: "#e6f7f2", color: "#0f9b6e",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 14, fontWeight: 700,
                              }}>{s.fullName[0]}</div>
                            )}
                            <span style={{ fontWeight: 600 }}>{s.fullName}</span>
                          </div>
                        </td>
                        <td className="mono" style={{ fontSize: 12, color: "var(--text-2)" }}>{s.studentId}</td>
                        <td>{s.className}</td>
                        <td style={{ fontSize: 12, color: "var(--text-3)" }}>
                          {new Date(s.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          {s.faceDescriptor?.length > 0
                            ? <span className="badge badge-success">✓ Enrolled</span>
                            : <span className="badge badge-warning">⚠ Missing</span>}
                        </td>
                        <td>
                          <button onClick={() => handleDelete(s._id)}
                            style={{
                              background: "none", border: "none", color: "var(--text-3)",
                              cursor: "pointer", fontSize: 16, padding: "4px 8px", borderRadius: 6,
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.color = "var(--danger)")}
                            onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-3)")}
                          >✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Attendance table */}
          {tab === "attendance" && (
            <div className="card" style={{ overflow: "hidden" }}>
              {filteredRecords.length === 0 ? (
                <Empty text={search || dateFilter ? "No records match your filters." : "No attendance records yet."} />
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student</th><th>ID</th><th>Class</th><th>Date</th><th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((r) => (
                      <tr key={r._id}>
                        <td style={{ fontWeight: 600 }}>{r.studentName}</td>
                        <td className="mono" style={{ fontSize: 12, color: "var(--text-2)" }}>{r.studentId}</td>
                        <td>{r.className}</td>
                        <td style={{ fontSize: 13, color: "var(--text-2)" }}>
                          {new Date(r.date + "T00:00:00").toLocaleDateString("en-GB", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                        </td>
                        <td style={{ fontSize: 13, color: "var(--text-2)" }}>
                          {new Date(r.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function Empty({ text }) {
  return (
    <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-3)" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>!</div>
      <p style={{ fontSize: 14 }}>{text}</p>
    </div>
  );
}
