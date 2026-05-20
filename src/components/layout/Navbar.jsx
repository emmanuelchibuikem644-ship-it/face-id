"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { apiLogout } from "../../lib/api";

const links = [
  { href: "/dashboard",  label: "Dashboard",      icon: "⊞" },
  { href: "/lecturer",   label: "Class Search",    icon: "🎓" },
  { href: "/records",    label: "Student Records", icon: "≡" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();

  const handleLogout = async () => {
    await apiLogout();
    router.push("/login");
  };

  return (
    <nav style={{
      height: 64,
      background: "#fff",
      borderBottom: "1px solid #e2dfd9",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 28px",
      position: "sticky", top: 0, zIndex: 100,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "#0f9b6e", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 17,
        }}>🎓</div>
        <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" }}>
          FaceCheck <span style={{ color: "#0f9b6e", fontSize: 13, fontWeight: 600 }}>Lecturer</span>
        </span>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", gap: 4 }}>
        {links.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <Link key={l.href} href={l.href} style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "7px 14px", borderRadius: 8,
              textDecoration: "none", fontSize: 13,
              fontWeight: active ? 600 : 500,
              color: active ? "#0f9b6e" : "#6b6760",
              background: active ? "#e6f7f2" : "transparent",
              transition: "all 0.16s",
            }}>
              <span>{l.icon}</span> {l.label}
            </Link>
          );
        })}
      </div>

      <button
        onClick={handleLogout}
        style={{
          padding: "7px 16px", borderRadius: 8,
          border: "1.5px solid #e2dfd9",
          background: "#f4f3f0", color: "#6b6760",
          fontFamily: "inherit", fontSize: 13, fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Sign Out
      </button>
    </nav>
  );
}
