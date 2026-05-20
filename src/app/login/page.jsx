"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiLogin } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm]     = useState({ email: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!form.email || !form.password) { setError("Please enter your email and password."); return; }
    setLoading(true);
    try {
      const data = await apiLogin(form.email, form.password);
      if (data.success) router.push("/dashboard");
      else setError(data.error || "Invalid credentials.");
    } catch {
      setError("Cannot reach the server. Make sure the backend is running.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", padding: 24,
    }}>
      <div className="card animate-fade-up" style={{ width: "100%", maxWidth: 420, padding: 40 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "#0f9b6e", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22,
          }}>🎓</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 20, letterSpacing: "-0.03em" }}>FaceCheck</div>
            <div style={{ fontSize: 12, color: "var(--text-3)" }}>Lecturer Portal — Restricted Access</div>
          </div>
        </div>

        {/* Warning banner */}
        <div style={{
          padding: "10px 14px", borderRadius: 8, marginBottom: 20,
          background: "#fef3c7", border: "1px solid #fde68a",
          fontSize: 13, color: "#92400e", display: "flex", alignItems: "center", gap: 8,
        }}>
          🔒 This portal is for authorised lecturers only.
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>Sign In</h1>
        <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 28 }}>
          Enter your university lecturer credentials.
        </p>

        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca",
            color: "#b91c1c", borderRadius: 8, padding: "12px 14px",
            fontSize: 13, marginBottom: 20,
          }}>{error}</div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>
              Email Address
            </label>
            <input
              className="input" type="email" placeholder="lecturer@university.edu"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              style={{ width: "100%", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>
              Password
            </label>
            <input
              className="input" type="password" placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              style={{ width: "100%", boxSizing: "border-box" }}
            />
          </div>

          <button
            className="btn"
            style={{
              width: "100%", justifyContent: "center",
              marginTop: 8, padding: "12px 0",
              background: "#0f9b6e", color: "#fff",
              fontSize: 15,
            }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </div>

        <p style={{ marginTop: 24, fontSize: 12, color: "var(--text-3)", textAlign: "center" }}>
          Contact your administrator if you have trouble logging in.
        </p>
      </div>
    </div>
  );
}
