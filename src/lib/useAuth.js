// lib/useAuth.js
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiMe } from "./api";

export function useAuth() {
  const router = useRouter();
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiMe().then((u) => {
      if (!u) { router.push("/login"); return; }
      setUser(u);
      setLoading(false);
    });
  }, [router]);

  return { user, loading };
}
