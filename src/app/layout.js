import "./globals.css";

export const metadata = {
  title: "FaceCheck – Student Portal",
  description: "Register and check in using face recognition",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* ── Top bar ── */}
        <header
          style={{
            height: 60,
            background: "#fff",
            borderBottom: "1px solid #e2dfd9",
            display: "flex",
            alignItems: "center",
            padding: "0 28px",
            position: "sticky",
            top: 0,
            zIndex: 100,
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34, height: 34, borderRadius: 9,
                background: "#4c3de3", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16,
              }}
            >
              ◉
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" }}>
              FaceCheck <span style={{ color: "#4c3de3", fontSize: 13, fontWeight: 600 }}>Student</span>
            </span>
          </div>

          {/* Navigation — students only see Register + Check In */}
          <nav style={{ display: "flex", gap: 4, marginLeft: 32 }}>
            <NavLink href="/register" label="✦ Register" />
            <NavLink href="/checkin"  label="◉ Check In" />
          </nav>
        </header>

        <main
          style={{
            minHeight: "calc(100vh - 60px)",
            padding: "32px 24px",
            maxWidth: 1100,
            margin: "0 auto",
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}

function NavLink({ href, label }) {
  return (
    <a
      href={href}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "7px 14px", borderRadius: 8,
        textDecoration: "none", fontSize: 13, fontWeight: 600,
        color: "#6b6760",
        transition: "all 0.15s",
      }}
    >
      {label}
    </a>
  );
}
