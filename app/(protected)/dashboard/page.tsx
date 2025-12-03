"use client";

import { useEffect, useMemo, useState } from "react";
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
      {/* BACKGROUND SF */}
      <AnimatedUniverse />

      {/* CONȚINUT */}
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-8">
        {/* TOP BAR */}
        <motion.header
          className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-slate-800/70 bg-slate-950/70 px-4 py-3 backdrop-blur-xl"
          initial={{ opacity: 0, y: -18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-emerald-400/80 bg-slate-950 shadow-[0_0_40px_rgba(16,185,129,0.9)]">
              <span className="text-lg font-black leading-none text-emerald-300">
                CH
              </span>
              <motion.div
                className="pointer-events-none absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(45,212,191,0.4),rgba(56,189,248,0.7),rgba(129,140,248,0.7),rgba(45,212,191,0.4))]"
                style={{ mixBlendMode: "screen" }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 40,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </div>
            <div className="leading-tight">
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
                Craiova Hackathon
              </p>
              <p className="text-sm font-semibold text-slate-50">
                User Control Hub
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,1)] animate-pulse" />
              <span className="text-emerald-100">
                Live sync · notificări WhatsApp
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-2 py-1">
              <div className="relative">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 via-sky-400 to-indigo-400 text-xs font-semibold text-slate-950">
                  {firstLetter}
                </span>
                <span className="pointer-events-none absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,1)]" />
              </div>
              <div className="hidden leading-tight sm:block">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                  Logat ca
                </p>
                <p className="text-xs font-medium text-slate-50">
                  {profile?.full_name || "utilizator anonim"}
                </p>
              </div>
            </div>
          </div>
        </motion.header>

        {/* HERO + STATUS */}
        <section className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1.1fr)]">
          {/* HERO LEFT */}
          <motion.div
            className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/80 p-6 shadow-[0_26px_90px_rgba(15,23,42,1)] backdrop-blur-xl sm:p-7 lg:p-8"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            {/* auroră internă */}
            <motion.div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.35),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.35),transparent_55%)] opacity-80"
              animate={{ opacity: [0.6, 0.9, 0.6] }}
              transition={{
                duration: 10,
                repeat: Infinity,
                repeatType: "mirror",
              }}
            />
            {/* scanline orizontal */}
            <motion.div
              className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-300/80 to-transparent"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            <div className="relative flex h-full flex-col gap-6">
              {/* badge + titlu */}
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-slate-950/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.25em] text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.7)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,1)]" />
                  {greeting}
                  {profile?.full_name ? `, ${profile.full_name}` : ""} · ești
                  în hub
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                    Panoul tău de control pentru{" "}
                    <span className="relative inline-block">
                      <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                        Craiova Hackathon
                      </span>
                      <span className="pointer-events-none absolute inset-x-0 -bottom-1 h-[2px] bg-gradient-to-r from-emerald-400/80 via-sky-400/80 to-indigo-400/80 blur-sm" />
                    </span>
                    .
                  </h1>
                  <p className="max-w-xl text-sm text-slate-200/90 sm:text-base">
                    Program live, echipe, resurse, leaderboard și notificări
                    automate. Tot hackathon-ul, condensat într-un singur ecran
                    care se simte ca un centru de comandă.
                  </p>
                </div>
              </div>

              {/* STAT STRIP FUTURISTIC */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950/80 p-4">
                <motion.div
                  className="pointer-events-none absolute inset-x-0 -top-24 h-32 bg-gradient-to-r from-emerald-400/10 via-sky-400/10 to-indigo-400/10 blur-3xl"
                  animate={{ x: ["-20%", "20%", "-20%"] }}
                  transition={{ duration: 16, repeat: Infinity }}
                />
                <div className="relative grid gap-3 text-xs sm:grid-cols-3 sm:text-sm">
                  <StatPill
                    label="Mod"
                    value="48h sprint intensiv"
                    accent="⚡"
                  />
                  <StatPill
                    label="Experiență"
                    value="Coding · business · design"
                    accent="💻"
                  />
                  <StatPill
                    label="Rolul tău"
                    value={profile?.role || "participant"}
                    accent={isAdmin ? "🛠️" : "🚀"}
                    highlight={isAdmin}
                  />
                </div>
              </div>

              {/* TAGS */}
              <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs">
                <Chip>💬 Notificări WhatsApp în timp real</Chip>
                <Chip>📡 Live updates de la organizatori</Chip>
                <Chip>🧭 Toate zonele hackathon-ului într-un loc</Chip>
                {isAdmin && (
                  <Chip variant="admin">🛠️ Zona admin deblocat</Chip>
                )}
              </div>

              {/* CTA ROW */}
              <div className="mt-auto flex flex-wrap gap-3 pt-2">
                <PrimaryButton asChild>
                  <Link href="/schedule">
                    Vezi programul live
                    <span className="ml-1.5 text-base">↗</span>
                  </Link>
                </PrimaryButton>
                <GhostButton asChild>
                  <Link href="/leaderboard">
                    Verifică leaderboard-ul
                    <span className="ml-1.5 text-base">🏆</span>
                  </Link>
                </GhostButton>
              </div>
            </div>
          </motion.div>

          {/* CARD PROFIL / STATUS CONT */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* glow de sub card */}
            <motion.div
              className="absolute inset-0 rounded-[28px] bg-gradient-to-b from-emerald-400/30 via-sky-400/10 to-indigo-500/0 opacity-80 blur-3xl"
              animate={{ opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 14, repeat: Infinity, repeatType: "mirror" }}
            />

            <div className="relative flex h-full flex-col rounded-3xl border border-slate-800/80 bg-slate-950/90 p-5 shadow-[0_28px_90px_rgba(0,0,0,1)] backdrop-blur-2xl sm:p-6">
              {/* bara de sus */}
              <div className="mb-4 flex items-center justify-between gap-2 text-[11px] text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,1)] animate-pulse" />
                  Starea contului
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  WhatsApp conectat
                </span>
              </div>

              {/* avatar + info */}
              <div className="mb-4 flex items-center gap-4">
                <div className="relative">
                  <motion.div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-sky-400 to-indigo-400 text-xl font-semibold text-slate-950 shadow-[0_0_40px_rgba(56,189,248,0.9)]"
                    animate={{ rotate: [0, -1.5, 1.5, 0] }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      repeatType: "mirror",
                    }}
                  >
                    {firstLetter}
                  </motion.div>
                  <div className="pointer-events-none absolute inset-0 rounded-2xl border border-emerald-300/60" />
                  <div className="pointer-events-none absolute -right-1 -top-1 h-3 w-3 rounded-full bg-sky-400 shadow-[0_0_14px_rgba(56,189,248,1)]" />
                </div>

                <div className="space-y-0.5">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
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

              {/* detalii + acțiuni profil */}
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

                    <div className="flex flex-wrap gap-2 pt-1">
                      <Link
                        href="/onboarding"
                        className="inline-flex items-center gap-1 rounded-full border border-emerald-400/80 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-200 transition hover:border-emerald-300 hover:text-emerald-100"
                      >
                        <span>Actualizează profilul</span>
                        <span className="text-xs">↗</span>
                      </Link>
                      <Link
                        href="/resources"
                        className="inline-flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1 text-[11px] font-medium text-slate-200 transition hover:border-slate-500 hover:text-slate-50"
                      >
                        <span>Ghidul participantului</span>
                      </Link>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-300 sm:text-sm">
                    Nu am găsit profilul tău. Refă onboarding-ul ca să-l
                    reconstruim.
                  </p>
                )}
              </div>

              {/* mini footer card */}
              <div className="mt-5 flex items-center justify-between border-t border-slate-800/80 pt-3 text-[10px] text-slate-500">
                <span>Craiova Hackathon · User Hub</span>
                <span>v1 · powered by Supabase</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ZONA PARTICIPANT */}
        <section className="mt-10 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Zona ta de participant
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-slate-300">
                  Alege următorul pas: vezi programul, intră în camera echipei,
                  verifică leaderboard-ul sau deschide resursele oficiale.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-[11px] text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,1)] animate-pulse" />
                <span>Hub sincronizat cu update-urile organizatorilor</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0, y: 12 },
              show: {
                opacity: 1,
                y: 0,
                transition: { staggerChildren: 0.07 },
              },
            }}
          >
            {userLinks.map((link) => (
              <motion.div
                key={link.href}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: { opacity: 1, y: 0 },
                }}
                whileHover={{
                  y: -6,
                  scale: 1.02,
                  rotateX: -2,
                  rotateY: 2,
                }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                style={{
                  transformPerspective: "1200px",
                }}
              >
                <Link
                  href={link.href}
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 text-sm shadow-[0_20px_60px_rgba(0,0,0,1)]"
                >
                  {/* contur lumină */}
                  <div className="pointer-events-none absolute inset-px rounded-[18px] border border-slate-700/40 opacity-0 transition group-hover:opacity-100" />
                  {/* glow gradient */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-sky-500/0 to-indigo-500/20 opacity-0 transition group-hover:opacity-100" />

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

        {/* ZONA ADMIN */}
        {isAdmin && (
          <section className="mt-12 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
                      Zona de administrare
                    </h2>
                    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-200">
                      doar pentru admini
                    </span>
                  </div>
                  <p className="mt-1 max-w-2xl text-sm text-slate-300">
                    Gestionezi programul, proiectele, punctajele, resursele și
                    utilizatorii. Ce faci aici e vizibil pentru toți
                    participanții.
                  </p>
                </div>
                <div className="rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-[11px] text-amber-100">
                  🛡️ Zona sensibilă – acțiunile sunt live
                </div>
              </div>
            </motion.div>

            <motion.div
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { staggerChildren: 0.07 },
                },
              }}
            >
              {adminLinks.map((link) => (
                <motion.div
                  key={link.href}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    show: { opacity: 1, y: 0 },
                  }}
                  whileHover={{
                    y: -6,
                    scale: 1.02,
                    rotateX: -2,
                    rotateY: 2,
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  style={{ transformPerspective: "1200px" }}
                >
                  <Link
                    href={link.href}
                    className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-amber-400/50 bg-gradient-to-br from-slate-950 via-slate-950 to-amber-900/25 p-4 text-sm shadow-[0_22px_70px_rgba(0,0,0,1)]"
                  >
                    <div className="pointer-events-none absolute inset-px rounded-[18px] border border-amber-300/40 opacity-0 transition group-hover:opacity-100" />
                    <motion.div
                      className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.28),transparent_55%)] opacity-0"
                      whileHover={{ opacity: 1 }}
                    />

                    <div className="relative mb-3 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/25 text-lg">
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
                      <span className="text-[10px] uppercase tracking-[0.18em] text-amber-200/80">
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

/* BACKGROUND SUPER ANIMAT */

function AnimatedUniverse() {
  return (
    <>
      {/* layer: grid holografic */}
      <div className="pointer-events-none absolute inset-0 opacity-50 mix-blend-soft-light [background-image:linear-gradient(to_right,rgba(148,163,184,0.17)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:80px_80px]" />

      {/* layer: auroră mare */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <motion.div
          className="absolute -left-40 top-[-10%] h-80 w-80 rounded-full bg-emerald-500/25 blur-3xl"
          animate={{ y: [0, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "mirror" }}
        />
        <motion.div
          className="absolute right-[-20%] top-[15%] h-96 w-96 rounded-full bg-sky-500/25 blur-3xl"
          animate={{ y: [0, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "mirror" }}
        />
        <motion.div
          className="absolute bottom-[-10%] left-[15%] h-72 w-72 rounded-full bg-indigo-500/22 blur-3xl"
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 22, repeat: Infinity, repeatType: "mirror" }}
        />
      </motion.div>

      {/* layer: inele orbitale */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <OrbitalRing size={640} delay={0} />
        <OrbitalRing size={520} delay={4} />
        <OrbitalRing size={400} delay={8} />
      </div>

      {/* layer: particule care urcă */}
      <ParticleField />
    </>
  );
}

function OrbitalRing({ size, delay = 0 }: { size: number; delay?: number }) {
  return (
    <motion.div
      className="rounded-full border border-emerald-400/10"
      style={{
        width: size,
        height: size,
        boxShadow: "0 0 50px rgba(16,185,129,0.18)",
      }}
      animate={{ rotate: 360 }}
      transition={{
        duration: 80,
        repeat: Infinity,
        ease: "linear",
        delay,
      }}
    >
      <motion.div
        className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,1)]"
        style={{
          position: "relative",
          top: size / 2 - 4,
          left: size / 2 - 4,
        }}
        animate={{ rotate: -360 }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
          delay,
        }}
      />
    </motion.div>
  );
}

function ParticleField() {
  const particles = new Array(40).fill(0);

  return (
    <div className="pointer-events-none absolute inset-0">
      {particles.map((_, i) => {
        const left = Math.random() * 100;
        const duration = 14 + Math.random() * 10;
        const delay = Math.random() * -20;
        const size = 1 + Math.random() * 2;

        return (
          <motion.span
            key={i}
            className="absolute rounded-full bg-slate-100/40 shadow-[0_0_10px_rgba(148,163,184,0.9)]"
            style={{
              left: `${left}%`,
              width: size,
              height: size,
              bottom: "-10%",
            }}
            animate={{ y: ["0%", "-130%"] }}
            transition={{
              duration,
              repeat: Infinity,
              delay,
              ease: "linear",
            }}
          />
        );
      })}
    </div>
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
          ? "border-emerald-400/70 bg-emerald-500/15 text-emerald-50"
          : "border-slate-700/80 bg-slate-900/80 text-slate-100"
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
    "inline-flex items-center justify-center rounded-full border border-emerald-400/80 bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-400 px-4 py-2 text-xs font-semibold text-slate-950 shadow-[0_0_32px_rgba(34,197,94,0.7)] transition hover:brightness-110 hover:shadow-[0_0_48px_rgba(56,189,248,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300";
  if (asChild) {
    return <span className={className}>{children}</span>;
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
    "inline-flex items-center justify-center rounded-full border border-slate-700/80 bg-slate-950/70 px-4 py-2 text-xs font-medium text-slate-100 shadow-[0_0_24px_rgba(15,23,42,1)] transition hover:border-slate-400 hover:text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/70";
  if (asChild) {
    return <span className={className}>{children}</span>;
  }
  return <button className={className}>{children}</button>;
}
