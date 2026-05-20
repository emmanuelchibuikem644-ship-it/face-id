"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/useAuth";
import { apiYearLevels, apiDepartments, apiSubjects, apiAddDepartment, apiDeleteDepartment } from "../../lib/api";
import Navbar from "../../components/layout/Navbar";

export default function LecturerPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [yearLevels,   setYearLevels]   = useState([]);
  const [departments,  setDepartments]  = useState([]);
  const [subjects,     setSubjects]     = useState([]);

  const [selectedYear,    setSelectedYear]    = useState("");
  const [selectedDept,    setSelectedDept]    = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const [newDept,      setNewDept]      = useState("");
  const [showAddDept,  setShowAddDept]  = useState(false);
  const [deptMsg,      setDeptMsg]      = useState("");
  const [dataLoading,  setDataLoading]  = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([apiYearLevels(), apiDepartments()]).then(([yl, depts]) => {
      setYearLevels(yl);
      setDepartments(depts);
      setDataLoading(false);
    });
  }, [user]);

  useEffect(() => {
    if (!selectedDept) { setSubjects([]); setSelectedSubject(""); return; }
    apiSubjects(selectedDept).then((s) => { setSubjects(s); setSelectedSubject(""); });
  }, [selectedDept]);

  const canProceed = selectedYear && selectedDept && selectedSubject;

  const handleGo = () => {
    if (!canProceed) return;
    const p = new URLSearchParams({ year: selectedYear, department: selectedDept, subject: selectedSubject });
    router.push(`/attendance?${p.toString()}`);
  };

  const handleAddDept = async () => {
    if (!newDept.trim()) return;
    const res = await apiAddDepartment(newDept.trim());
    if (res.success) {
      setDepartments(res.departments);
      setNewDept("");
      setDeptMsg(`✓ "${newDept.trim()}" added.`);
      setTimeout(() => setDeptMsg(""), 3000);
    } else {
      setDeptMsg(res.error || "Failed.");
    }
  };

  const handleDeleteDept = async (name) => {
    if (!confirm(`Remove "${name}"?`)) return;
    const res = await apiDeleteDepartment(name);
    if (res.success) { setDepartments(res.departments); if (selectedDept === name) setSelectedDept(""); }
  };

  if (loading || dataLoading) {
    return (
      <><Navbar />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <p style={{ color: "var(--text-2)" }}>Loading…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 700, margin: "0 auto", padding: "32px 24px" }}>
        <div className="animate-fade-up">
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", margin: 0 }}>
              Class Search
            </h1>
            <p style={{ color: "var(--text-2)", marginTop: 6, fontSize: 14 }}>
              Select year, department, and subject to view attendance.
            </p>
          </div>

          {/* Step 1 — Year Level */}
          <div className="card" style={{ padding: 28, marginBottom: 16 }}>
            <SectionLabel number="1" label="Select Year Level" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginTop: 16 }}>
              {yearLevels.map((y) => (
                <button key={y.value} onClick={() => setSelectedYear(y.value)}
                  style={{
                    padding: "14px 8px", borderRadius: 10, cursor: "pointer",
                    border: `2px solid ${selectedYear === y.value ? "#0f9b6e" : "var(--border)"}`,
                    background: selectedYear === y.value ? "#e6f7f2" : "var(--surface)",
                    color: selectedYear === y.value ? "#0f9b6e" : "var(--text)",
                    fontWeight: selectedYear === y.value ? 700 : 500,
                    fontSize: 13, textAlign: "center", transition: "all 0.15s", fontFamily: "inherit",
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 4 }}>
                    {["①","②","③","④","⑤"][+y.value - 1]}
                  </div>
                  {y.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2 — Department */}
          <div className="card" style={{ padding: 28, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <SectionLabel number="2" label="Select Department" />
              <button
                onClick={() => setShowAddDept((p) => !p)}
                style={{
                  padding: "6px 14px", borderRadius: 8,
                  border: "1.5px solid var(--border)", background: "var(--surface-2)",
                  fontFamily: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}
              >
                {showAddDept ? "✕ Cancel" : "+ Add Department"}
              </button>
            </div>

            {showAddDept && (
              <div style={{
                marginTop: 14, padding: "14px 16px",
                background: "var(--surface-2)", borderRadius: 10,
                display: "flex", gap: 10, alignItems: "center",
              }}>
                <input
                  className="input" placeholder="New department name…"
                  value={newDept} onChange={(e) => setNewDept(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddDept()}
                  style={{ flex: 1 }}
                />
                <button
                  onClick={handleAddDept}
                  style={{
                    padding: "10px 18px", borderRadius: 8,
                    background: "#0f9b6e", color: "#fff",
                    border: "none", fontFamily: "inherit",
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}
                >Add</button>
                {deptMsg && (
                  <span style={{ fontSize: 13, color: deptMsg.startsWith("✓") ? "#0f9b6e" : "var(--danger)" }}>
                    {deptMsg}
                  </span>
                )}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginTop: 16 }}>
              {departments.map((d) => (
                <div key={d}
                  onClick={() => setSelectedDept(d)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                    border: `2px solid ${selectedDept === d ? "#0f9b6e" : "var(--border)"}`,
                    background: selectedDept === d ? "#e6f7f2" : "var(--surface)",
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{
                    flex: 1, fontWeight: selectedDept === d ? 700 : 500,
                    color: selectedDept === d ? "#0f9b6e" : "var(--text)", fontSize: 14,
                  }}>{d}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteDept(d); }}
                    style={{
                      background: "none", border: "none", color: "var(--text-3)",
                      cursor: "pointer", fontSize: 14, padding: "2px 4px", flexShrink: 0,
                    }}
                    title="Remove department"
                  >✕</button>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3 — Subject */}
          {selectedDept && (
            <div className="card animate-fade-up" style={{ padding: 28, marginBottom: 16 }}>
              <SectionLabel number="3" label={`Subject — ${selectedDept}`} />
              {subjects.length === 0 ? (
                <p style={{ color: "var(--text-3)", fontSize: 14, marginTop: 12 }}>
                  No subjects found for this department.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 16 }}>
                  {subjects.map((s) => (
                    <button key={s} onClick={() => setSelectedSubject(s)}
                      style={{
                        padding: "12px 16px", borderRadius: 8, cursor: "pointer",
                        border: `2px solid ${selectedSubject === s ? "#0f9b6e" : "var(--border)"}`,
                        background: selectedSubject === s ? "#e6f7f2" : "var(--surface)",
                        color: selectedSubject === s ? "#0f9b6e" : "var(--text)",
                        fontWeight: selectedSubject === s ? 700 : 500,
                        fontSize: 14, textAlign: "left", transition: "all 0.15s",
                        fontFamily: "inherit",
                        display: "flex", alignItems: "center", gap: 10,
                      }}
                    >
                      <span>{selectedSubject === s ? "●" : "○"}</span> {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Summary + Go */}
          {canProceed && (
            <div className="card animate-fade-up" style={{
              padding: 24, border: "2px solid #0f9b6e", background: "#e6f7f2",
            }}>
              <div style={{ fontSize: 13, color: "#0f9b6e", fontWeight: 700, marginBottom: 10 }}>
                ✓ Ready to view attendance
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.8 }}>
                <b>Year:</b> Year {selectedYear} &nbsp;·&nbsp;
                <b>Dept:</b> {selectedDept} &nbsp;·&nbsp;
                <b>Subject:</b> {selectedSubject}
              </div>
              <button
                onClick={handleGo}
                style={{
                  marginTop: 16, padding: "12px 28px", fontSize: 15,
                  background: "#0f9b6e", color: "#fff",
                  border: "none", borderRadius: 8,
                  fontFamily: "inherit", fontWeight: 700, cursor: "pointer",
                }}
              >
                View Attendance Records →
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function SectionLabel({ number, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 26, height: 26, borderRadius: "50%",
        background: "#0f9b6e", color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 700, flexShrink: 0,
      }}>{number}</div>
      <span style={{ fontWeight: 700, fontSize: 16 }}>{label}</span>
    </div>
  );
}
