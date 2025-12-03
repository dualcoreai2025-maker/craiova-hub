"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";

type Profile = {
  id: string;
  full_name: string | null;
  role: string | null;
};

// link-uri pentru toți userii (participant / mentor / etc.)
const userLinks = [
  {
    href: "/schedule",
    label: "Program & evenimente",
    description: "Vezi toate sesiunile, workshop-urile și programul complet.",
    icon: "🗓️",
  },
  {
    href: "/teams",
    label: "Echipe",
    description: "Vezi și gestionează echipele din care faci parte.",
    icon: "👥",
  },
  {
    href: "/resources",
    label: "Resurse & materiale",
    description: "Access la materiale, link-uri utile și guidelines.",
    icon: "📚",
  },
  {
    href: "/leaderboard",
    label: "Leaderboard",
    description: "Vezi punctajele echipelor și progresul lor.",
    icon: "🏆",
  },
  {
    href: "/onboarding",
    label: "Profil & notificări",
    description:
      "Actualizează-ți numele, telefonul WhatsApp și preferințele de notificare.",
    icon: "🧾",
  },
];

// link-uri pentru admin (doar rol admin le vede)
const adminLinks = [
  {
    href: "/admin/events",
    label: "Admin – Evenimente",
    description: "Adaugă, editează și șterge evenimentele din program.",
    icon: "🛠️",
  },
  {
    href: "/admin/projects",
    label: "Admin – Proiecte",
    description: "Vezi și administrează proiectele echipelor.",
    icon: "📁",
  },
  {
    href: "/admin/points",
    label: "Admin – Puncte",
    description: "Gestionează sistemul de punctaj și leaderboard-ul.",
    icon: "⭐",
  },
  {
    href: "/admin/resources",
    label: "Admin – Resurse",
    description: "Adaugă materiale și link-uri în secțiunea de resurse.",
    icon: "📚",
  },
  {
    href: "/admin/users",
    label: "Admin – Utilizatori",
    description: "Gestionează profilurile și rolurile utilizatorilor.",
    icon: "👤",
  },
];

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setErrorMsg(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorMsg("Trebuie să fii logat ca să accesezi dashboard-ul.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error(error);
        setErrorMsg("Nu am putut încărca profilul.");
      } else if (data) {
        setProfile(data as Profile);
      }

      setLoading(false);
    };

    loadProfile();
  }, []);

  const isAdmin = profile?.role === "admin";

  const firstLetter = useMemo(() => {
    if (!profile?.full_name) return "C";
    return profile.full_name.trim().charAt(0).toUpperCase();
  }, [profile?.full_name]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bună dimineața";
    if (hour < 18) return "Bună";
    return "Bună seara";
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      {/* LAYER 1: glow-uri mari */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(129,140,248,0.24),_transparent_55%)]" />
      {/* LAYER 2: grid techy */}
      <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay [background-image:linear-gradient(to_right,rgba(148,163,184,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.15)_1px,transparent_1px)] [background-size:80px_80px]" />
      {/* LAYER 3: blur blobs */}
      <div className="pointer-events-none absolute -left-24 top-32 h-64 w-64 rounded-full bg-emerald-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-sky-500/25 blur-3xl" />

      {/* CONȚINUT */}
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-8">
        {/* TOP NAV */}
        <motion.header
          className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800/70 bg-slate-950/70 px-4 py-3 backdrop-blur"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-2xl border border-emerald-400/60 bg-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.5)]">
              <span className="text-lg font-black leading-none text-emerald-300">
                CH
              </span>
              <div className="pointer-events-none absolute inset-0 bg-[conic-gradient(from_180deg_at_50%_50%,rgba(45,212,191,0.5),rgba(56,189,248,0.5),rgba(129,140,248,0.5),rgba(45,212,191,0.5))] opacity-40 mix-blend-screen" />
            </div>
            <div className="leading-tight">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Craiova Hackathon
              </p>
              <p className="text-sm font-semibold text-slate-50">
                Participant Hub
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
              <span className="text-slate-300">
                Live ·{" "}
                <span className="text-emerald-300/90">
                  notificări WhatsApp active
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-2 py-1">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/80 via-sky-400/80 to-indigo-400/80 text-xs font-semibold text-slate-950">
                {firstLetter}
              </span>
              <div className="hidden leading-tight sm:block">
                <p className="text-[11px] text-slate-400">Logat ca</p>
                <p className="text-xs font-medium text-slate-50">
                  {profile?.full_name || "utilizator anonim"}
                </p>
              </div>
            </div>
          </div>
        </motion.header>

        {/* HERO + PROFIL */}
        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.05fr)]">
          {/* HERO LEFT */}
          <motion.div
            className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/80 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.95)] backdrop-blur-xl sm:p-7 lg:p-8"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            {/* glow accent diagonale */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.28),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.26),transparent_55%)] opacity-70" />
            {/* „scan lines” light */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent" />

            <div className="relative flex flex-col gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.23em] text-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                  {greeting}{" "}
                  {profile?.full_name ? `, ${profile.full_name}` : ""} 👋
                </div>

                <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                  Hub-ul oficial pentru{" "}
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-emerald-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                      tot hackathon-ul
                    </span>
                    <span className="pointer-events-none absolute inset-x-0 -bottom-1 h-[2px] w-full bg-gradient-to-r from-emerald-400/60 via-sky-400/80 to-indigo-400/60 blur-[1.5px]" />
                  </span>
                  .
                </h1>

                <p className="max-w-xl text-sm text-slate-200/90 sm:text-base">
                  De aici controlezi experiența ta: program, echipă, resurse,
                  leaderboard și notificări în timp real. Totul într-o singură
                  interfață gândită special pentru Craiova Hackathon.
                </p>
              </div>

              {/* Stat cards mini – „telemetrie” hackathon */}
              <div className="grid gap-3 text-xs sm:grid-cols-3 sm:text-sm">
                <StatPill
                  label="Tip experiență"
                  value="48h intensiv · coding · business · design"
                  accent="💻"
                />
                <StatPill
                  label="Ce primești"
                  value="Mentorat, resurse, provocări și premii"
                  accent="🏆"
                />
                <StatPill
                  label="Rolul tău"
                  value={profile?.role || "participant"}
                  accent={isAdmin ? "🛠️" : "🚀"}
                  highlight={isAdmin}
                />
              </div>

              <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs">
                <Chip>💬 Notificări automate pe WhatsApp</Chip>
                <Chip>📡 Update-uri live de la organizatori</Chip>
                <Chip>🧭 Toate zonele hackathon-ului într-un singur loc</Chip>
                {isAdmin && <Chip variant="admin">🛠️ Mod administrare activ</Chip>}
              </div>

              {/* CTA row */}
              <div className="mt-2 flex flex-wrap gap-3">
                <PrimaryButton asChild>
                  <Link href="/schedule">
                    Vezi programul complet
                    <span className="ml-1.5 text-base">↗</span>
                  </Link>
                </PrimaryButton>
                <GhostButton asChild>
                  <Link href="/teams">
                    Intră în camera echipei
                    <span className="ml-1.5 text-base">👥</span>
                  </Link>
                </GhostButton>
              </div>
            </div>
          </motion.div>

          {/* CARD PROFIL / STATUS CONT */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
          >
            <div className="absolute inset-0 rounded-[26px] bg-gradient-to-b from-emerald-400/25 via-sky-500/10 to-indigo-500/0 opacity-60 blur-2xl" />

            <div className="relative rounded-3xl border border-slate-800/80 bg-slate-950/90 p-5 shadow-[0_22px_80px_rgba(15,23,42,0.9)] backdrop-blur-xl sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-2 text-[11px] text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                  Starea contului
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  WhatsApp linkat
                </span>
              </div>

              {/* AVATAR + INFO */}
              <div className="mb-4 flex items-center gap-4">
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-sky-400 to-indigo-400 text-xl font-semibold text-slate-950 shadow-[0_0_30px_rgba(56,189,248,0.7)]">
                    {firstLetter}
                  </div>
                  <div className="pointer-events-none absolute inset-0 rounded-2xl border border-emerald-300/50/70" />
                  <div className="pointer-events-none absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                </div>

                <div className="space-y-0.5">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    Profil hackathon
                  </p>
                  <p className="text-sm font-semibold text-slate-50 sm:text-base">
                    {profile?.full_name || "Nume nespecificat"}
                  </p>
                  <p className="text-xs text-slate-400">
                    Rol:{" "}
                    <span className="font-medium text-emerald-200">
                      {profile?.role || "participant"}
                    </span>
                    {isAdmin && (
                      <span className="ml-1 rounded-full border border-amber-300/60 bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-100">
                        admin
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* BODY */}
              <div className="space-y-3 text-sm">
                {loading ? (
                  <div className="space-y-2">
                    <SkeletonLine />
                    <SkeletonLine width="70%" />
                    <SkeletonLine width="50%" />
                  </div>
                ) : errorMsg ? (
                  <p className="text-xs text-red-400 sm:text-sm">{errorMsg}</p>
                ) : profile ? (
                  <>
                    <div className="grid gap-2 text-xs text-slate-300 sm:text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-400">Nume</span>
                        <span className="font-medium">
                          {profile.full_name || "Nespecificat"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-400">Rol</span>
                        <span className="font-medium">
                          {profile.role || "participant"}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">
                      Poți actualiza telefonul, numele și preferințele de
                      notificare din pagina de profil.
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <Link
                        href="/onboarding"
                        className="inline-flex items-center gap-1 rounded-full border border-emerald-400/70 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-200 transition hover:border-emerald-300 hover:text-emerald-100"
                      >
                        <span>Actualizează profilul</span>
                        <span className="text-xs">↗</span>
                      </Link>
                      <Link
                        href="/resources"
                        className="inline-flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1 text-[11px] font-medium text-slate-200 transition hover:border-slate-500 hover:text-slate-50"
                      >
                        <span>Vezi ghidul participantului</span>
                      </Link>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-300 sm:text-sm">
                    Nu am găsit profilul tău. Încearcă să refaci onboarding-ul
                    pentru a-l reconstrui.
                  </p>
                )}
              </div>

              {/* mini footer */}
              <div className="mt-5 flex items-center justify-between border-t border-slate-800/80 pt-3 text-[10px] text-slate-500">
                <span>Craiova Hackathon · User Hub</span>
                <span>v1 · powered by supabase</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ZONA PARTICIPANT */}
        <section className="mt-10 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Zona ta de participant
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-slate-300">
                  Alege următoarea mișcare: verifică programul, intră în zona
                  echipei, urmărește leaderboard-ul sau deschide resursele și
                  ghidurile oficiale.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-[11px] text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse shadow-[0_0_10px_rgba(56,189,248,0.9)]" />
                <span>Hub sincronizat cu update-urile din timpul hackathon-ului</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: {
                opacity: 1,
                y: 0,
                transition: { staggerChildren: 0.06 },
              },
            }}
          >
            {userLinks.map((link) => (
              <motion.div
                key={link.href}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: { opacity: 1, y: 0 },
                }}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <Link
                  href={link.href}
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 text-sm shadow-[0_18px_50px_rgba(15,23,42,0.9)] transition"
                >
                  {/* gradient edge */}
                  <div className="pointer-events-none absolute inset-px rounded-[18px] border border-slate-700/40 opacity-0 transition group-hover:opacity-100" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-sky-500/0 to-indigo-500/10 opacity-0 transition group-hover:opacity-100" />

                  <div className="relative mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/90 text-lg">
                      {link.icon}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-50 sm:text-base">
                      {link.label}
                    </h3>
                  </div>

                  <p className="relative mb-4 text-xs text-slate-400">
                    {link.description}
                  </p>

                  <div className="relative mt-auto flex items-center justify-between text-[11px] font-semibold text-emerald-300">
                    <span className="inline-flex items-center gap-1 group-hover:text-emerald-200">
                      Deschide
                      <span className="mt-[1px] transition-transform group-hover:translate-x-0.5">
                        ↗
                      </span>
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500 group-hover:text-slate-300">
                      zona participant
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ZONA ADMIN – doar pentru admini */}
        {isAdmin && (
          <section className="mt-12 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">
                      Zona de administrare
                    </h2>
                    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-200">
                      doar pentru admini
                    </span>
                  </div>
                  <p className="mt-1 max-w-2xl text-sm text-slate-300">
                    Controlezi programul, proiectele, punctajele, resursele și
                    utilizatorii. Tot ce faci aici este vizibil pentru toți
                    participanții din hub.
                  </p>
                </div>
                <div className="rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-[11px] text-amber-100">
                  🛡️ Acces cu responsabilitate – modificările sunt live
                </div>
              </div>
            </motion.div>

            <motion.div
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { staggerChildren: 0.06 },
                },
              }}
            >
              {adminLinks.map((link) => (
                <motion.div
                  key={link.href}
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    show: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <Link
                    href={link.href}
                    className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-amber-400/50 bg-gradient-to-br from-slate-950 via-slate-950 to-amber-900/20 p-4 text-sm shadow-[0_18px_60px_rgba(0,0,0,0.7)]"
                  >
                    <div className="pointer-events-none absolute inset-px rounded-[18px] border border-amber-300/40 opacity-0 transition group-hover:opacity-100" />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.25),transparent_55%)] opacity-0 transition group-hover:opacity-100" />

                    <div className="relative mb-3 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-lg">
                        {link.icon}
                      </div>
                      <h3 className="text-sm font-semibold text-amber-50 sm:text-base">
                        {link.label}
                      </h3>
                    </div>

                    <p className="relative mb-4 text-xs text-amber-50/90">
                      {link.description}
                    </p>

                    <div className="relative mt-auto flex items-center justify-between text-[11px] font-semibold text-amber-100">
                      <span className="inline-flex items-center gap-1 group-hover:text-amber-50">
                        Intră în panou
                        <span className="mt-[1px] transition-transform group-hover:translate-x-0.5">
                          ↗
                        </span>
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.18em] text-amber-200/70">
                        admin zone
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}
      </div>
    </main>
  );
}

/* Helpers UI */

function Chip({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "admin";
}) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-[11px] border backdrop-blur";
  const styles =
    variant === "admin"
      ? "border-amber-400/60 bg-amber-500/15 text-amber-100"
      : "border-slate-700/80 bg-slate-900/80 text-slate-100";

  return <span className={`${base} ${styles}`}>{children}</span>;
}

function SkeletonLine({ width = "100%" }: { width?: string }) {
  return (
    <div
      className="h-3 rounded-full bg-slate-800/80 animate-pulse"
      style={{ width }}
    />
  );
}

function StatPill({
  label,
  value,
  accent,
  highlight,
}: {
  label: string;
  value: string;
  accent?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded-2xl border px-3 py-2 ${
        highlight
          ? "border-emerald-400/70 bg-emerald-500/10 text-emerald-50"
          : "border-slate-700/70 bg-slate-900/70 text-slate-100"
      }`}
    >
      <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em] text-slate-400">
        <span className="truncate">{label}</span>
        {accent && <span className="text-[13px]">{accent}</span>}
      </div>
      <p className="mt-1 text-xs font-medium leading-snug text-slate-100">
        {value}
      </p>
    </div>
  );
}

function PrimaryButton({
  children,
  asChild,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) {
  const className =
    "inline-flex items-center justify-center rounded-full border border-emerald-400/80 bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-400 px-4 py-2 text-xs font-semibold text-slate-950 shadow-[0_0_30px_rgba(34,197,94,0.6)] transition hover:brightness-110 hover:shadow-[0_0_40px_rgba(56,189,248,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300";
  if (asChild) {
    return (
      <span className={className}>
        {children}
      </span>
    );
  }
  return <button className={className}>{children}</button>;
}

function GhostButton({
  children,
  asChild,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) {
  const className =
    "inline-flex items-center justify-center rounded-full border border-slate-700/80 bg-slate-950/70 px-4 py-2 text-xs font-medium text-slate-100 shadow-[0_0_20px_rgba(15,23,42,0.9)] transition hover:border-slate-400 hover:text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/70";
  if (asChild) {
    return (
      <span className={className}>
        {children}
      </span>
    );
  }
  return <button className={className}>{children}</button>;
}
