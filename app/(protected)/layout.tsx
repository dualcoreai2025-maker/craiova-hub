"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      // dacă nu avem sesiune → trimite la /login
      if (!data.session) {
        router.push("/login");
      } else {
        setChecking(false);
      }
    };

    checkSession();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        Verificare sesiune...
      </div>
    );
  }

  // dacă user-ul e logat, afișăm conținutul paginilor protejate
  return <>{children}</>;
}
