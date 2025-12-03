"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // 1) login cu email + parolă
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    // 2) luăm user-ul logat
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMsg("Nu s-a putut prelua user-ul.");
      setLoading(false);
      return;
    }

    // 3) verificăm dacă are profil în tabela `profiles`
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error(profileError);
      setErrorMsg("Eroare la verificarea profilului.");
      setLoading(false);
      return;
    }

    // 4) dacă nu are profil -> trimitem la /onboarding
    if (!profile) {
      router.push("/onboarding");
    } else {
      // dacă are profil -> mergem în dashboard
      router.push("/dashboard");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* BG glow */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.16),_transparent_55%)]" />

      <section className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-10 md:flex-row md:items-center md:justify-between md:py-0">
        {/* Left side: text / branding */}
        <div className="mb-10 space-y-4 md:mb-0 md:w-1/2">
          <p className="text-xs uppercase tracking-[0.25em] text-indigo-300/80">
            craiova hackathon
          </p>
          <h1 className="text-3xl font-bold md:text-4xl">
            Bine ai revenit,{" "}
            <span className="text-indigo-400">loghează-te</span> și intră în
            hub.
          </h1>
          <p className="text-sm text-slate-300 max-w-md">
            De aici poți accesa dashboard-ul, echipa ta, programul și notificările
            pentru evenimente. Autentificarea este necesară pentru a-ți păstra
            progresul și setările.
          </p>

          <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-300">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Acces la dashboard & echipă
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              Program & notificări în timp real
            </div>
          </div>
        </div>

        {/* Right side: login card */}
        <div className="md:w-[380px] w-full max-w-md md:max-w-none mx-auto">
          <div className="relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-indigo-500/40 via-emerald-400/30 to-sky-500/30 blur-xl opacity-70" />
            <form
              onSubmit={handleLogin}
              className="relative space-y-4 rounded-3xl border border-slate-800 bg-slate-900/80 px-6 py-6 shadow-[0_0_40px_rgba(15,23,42,0.9)]"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div>
                  <h2 className="text-lg font-semibold">Autentificare</h2>
                  <p className="text-xs text-slate-400">
                    Folosește contul cu care te-ai înscris la hackathon.
                  </p>
                </div>
                {loading && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-[11px] text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                    Se verifică datele...
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Parola
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-red-400 border border-red-500/40 bg-red-900/20 rounded-md px-3 py-2">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_25px_rgba(129,140,248,0.6)] transition hover:bg-indigo-400 disabled:opacity-60 disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <span className="h-3 w-3 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                    <span>Autentificare...</span>
                  </>
                ) : (
                  <>Login</>
                )}
              </button>

              <p className="mt-1 text-[11px] text-slate-500 text-center">
                Dacă este prima ta autentificare, după login vei fi trimis la
                pagina de completare a profilului.
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
