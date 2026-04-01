"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserPlus, Camera, FileText } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { name: "Register", href: "/", icon: UserPlus },
    { name: "CheckIn", href: "/checkin", icon: Camera },
    { name: "Records", href: "/records", icon: FileText },
  ];

  return (
    <main
      className="
      bg-white flex w-full justify-between items-center px-4 sm:px-6 py-3 shadow-sm
      fixed bottom-0 left-0 z-50
      md:static md:top-0
      "
    >
      
      {/* LEFT */}
      <div className="hidden md:flex items-center gap-2">
        <img
          className="w-12 h-12 object-cover"
          src="/download (14).png"
          alt=""
        />
        <h1 className="text-xl font-bold text-black">Face ID</h1>
      </div>

      {/* RIGHT */}
      <div className="flex w-full md:w-auto justify-around md:justify-end items-center gap-2 sm:gap-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-3 py-2 rounded-full transition-all text-xs sm:text-sm
                ${
                  isActive
                    ? "bg-purple-100 text-purple-600"
                    : "text-gray-600 hover:bg-purple-50 hover:text-purple-600"
                }
              `}
            >
              <Icon size={18} />
              <span className="hidden sm:block md:block">
                {link.name}
              </span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}