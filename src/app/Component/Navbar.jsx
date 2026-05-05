"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UserPlus, ScanFace, FileText } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navItem = (href, icon, label) => {
    const isActive = pathname === href;

    return (
      <Link href={href}>
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition
          ${
            isActive
              ? "bg-purple-100 text-purple-600"
              : "text-gray-600 hover:text-black"
          }`}
        >
          {icon}
          {label}
        </div>
      </Link>
    );
  };

  return (
    <div className="w-full border-b bg-white px-6 py-3 flex items-center justify-between">
      {/* Logo */}
      <Link href="/">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="bg-purple-600 text-white p-2 rounded-xl">
            <ScanFace size={18} />
          </div>
          <h1 className="font-semibold text-lg">FaceCheck</h1>
        </div>
      </Link>

      {/* Menu */}
      <div className="flex items-center gap-6 text-sm">
        {navItem("/", <Home size={16} />, "Dashboard")}
        {navItem("/register", <UserPlus size={16} />, "Register")}
        {navItem("/check-in", <ScanFace size={16} />, "Check In")}
        {navItem("/records", <FileText size={16} />, "Records")}
      </div>
    </div>
  );
}