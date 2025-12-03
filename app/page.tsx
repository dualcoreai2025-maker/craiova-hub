"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function RootRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        // dacă există sesiune -> mergem în dashboard (segmentul (protected))
        router.replace("/dashboard");
      } else {
        // dacă nu există sesiune -> mergem la login
        router.replace("/login");
      }
    };

    checkSession();
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <p className="text-sm text-slate-400">Se verifică sesiunea ta...</p>
    </main>
  );
}
