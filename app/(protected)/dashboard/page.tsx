"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";

type Profile = {
  id: string;
  full_name: string | null;
  role: string | null;
};

// link-uri pentru toți userii
const quickLinks = [
  {
    href: "/schedule",
    label: "Program & evenimente",
    description: "Timeline complet pentru toate zilele de hackathon.",
    icon: "🗓️",
    badge: "Important azi",
  },
  {
    href: "/teams",
    label: "Echipa ta",
    description: "Vezi echipa în care ești, rolurile și invitațiile.",
    icon: "👥",
    badge: "Colaborare",
  },
  {
    href: "/resources",
    label: "Resurse & materiale",
    description: "Tutoriale, ghiduri, repo-uri și alte materiale utile.",
    icon: "📚",
    badge: "Knowledge",
  },
  {
    href: "/leaderboard",
    label: "Leaderboard",
    description: "Clasamentul echipelor după punctaj.",
    icon: "🏆",
    badge: "Live",
  },
  {
    href: "/onboarding",
    label: "Profil & notificări",
    description: "Actualizează-ți datele și reminder-ele WhatsApp.",
    icon: "🧾",
    badge: "Profil",
  },
];

// link-uri pentru admin
const adminLinks = [
  {
    href: "/admin/events",
    label: "Evenimente",
    description: "Creează și ajustează programul hackathon-ului.",
    icon: "🛠️",
  },
  {
    href: "/admin/projects",
    label: "Proiecte",
    description: "Vezi livrabilele echipelor și statusul lor.",
    icon: "📁",
  },
  {
    href: "/admin/points",
    label: "Puncte & scoring",
    description: "Atribuie puncte, actualizează leaderboard-ul.",
    icon: "⭐",
  },
  {
    href: "/admin/resources",
    label: "Resurse",
    description: "Adaugă materiale noi pentru participanți.",
    icon: "📚",
  },
  {
    href: "/admin/users",
    label: "Utilizatori",
    description: "Gestionează profiluri, roluri și acces.",
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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* Glow global */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(52,211,153,0.18),_transparent_55%)]" />

      <motion.div
        className="relative mx-auto max-w-6xl px-4 pb-16 pt-8 md:pt-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        {/* HEADER */}
        <header className="mb-8 flex flex-col gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.25em] text-indigo-300/80">
              craiova hackathon · dashboard
            </p>
            <h1 className="text-2xl font-semibold sm:text-3xl md:text-4xl">
              Salut
              {profile?.full_name ? `, ${profile.full_name}` : ""}! 👋
            </h1>
            <p className="max-w-xl text-sm text-slate-300">
              De aici coordonezi tot: program, echipă, proiect și resurse.
              Începe cu cele mai importante acțiuni pentru următoarele ore.
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 md:items-end">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-[11px] text-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Status:{" "}
                <span className="font-semibold text-emerald-300">
                  conectat
                </span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Nu uita să îți verifici{" "}
              <Link
                href="/schedule"
                className="text-sky-400 hover:text-sky-300"
              >
                programul
              </Link>{" "}
              și{" "}
              <Link
                href="/teams"
                className="text-sky-400 hover:text-sky-300"
              >
                echipa
              </Link>
              .
            </p>
          </div>
        </header>

        {/* GRID PRINCIPAL */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)]">
          {/* COL STÂNGA */}
          <div className="space-y-6">
            {/* CARD PROFIL + TODAY */}
            <motion.section
              className="grid gap-4 md:grid-cols-2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-md shadow-slate-950/60">
                <h2 className="mb-2 text-sm font-semibold text-slate-100">
                  Profilul tău
                </h2>
                {loading ? (
                  <div className="space-y-2">
                    <SkeletonLine />
                    <SkeletonLine width="80%" />
                    <SkeletonLine width="60%" />
                  </div>
                ) : errorMsg ? (
                  <p className="text-sm text-red-400">{errorMsg}</p>
                ) : profile ? (
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-slate-400">Nume: </span>
                      <span className="font-medium">
                        {profile.full_name || "Nespecificat"}
                      </span>
                    </p>
                    <p>
                      <span className="text-slate-400">Rol: </span>
                      <span className="font-medium">
                        {profile.role || "participant"}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500">
                      Poți actualiza telefonul și preferințele de notificare
                      din pagina de profil.
                    </p>
                    <Link
                      href="/onboarding"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 hover:text-emerald-200"
                    >
                      → Editează profilul
                    </Link>
                  </div>
                ) : (
                  <p className="text-sm text-slate-300">
                    Nu am găsit profilul tău. Încearcă să refaci onboarding-ul.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/60 p-4 shadow-md shadow-slate-950/60">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-100">
                    Următorul pas
                  </h2>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                    recomandat
                  </span>
                </div>
                <p className="text-sm text-slate-300">
                  Verifică programul de azi și asigură-te că echipa ta este
                  configurată corect înainte de următoarea sesiune.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <LinkChip href="/schedule">🗓️ Vezi programul</LinkChip>
                  <LinkChip href="/teams">👥 Echipă & invitații</LinkChip>
                  <LinkChip href="/resources">📚 Ghiduri utile</LinkChip>
                </div>
              </div>
            </motion.section>

            {/* QUICK ACTIONS */}
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.45 }}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-100">
                  Quick actions
                </h2>
                <p className="text-[11px] text-slate-500">
                  Navighează rapid în zonele pe care le folosești cel mai des.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {quickLinks.map((link, idx) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.22 + idx * 0.04,
                      duration: 0.35,
                    }}
                  >
                    <Link
                      href={link.href}
                      className="group flex h-full flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-sm shadow-sm shadow-slate-950/40 transition hover:-translate-y-1 hover:border-emerald-400/70 hover:bg-slate-900"
                    >
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{link.icon}</span>
                          <h3 className="font-semibold">{link.label}</h3>
                        </div>
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                          {link.badge}
                        </span>
                      </div>
                      <p className="mb-3 text-xs text-slate-400">
                        {link.description}
                      </p>
                      <span className="mt-auto inline-flex items-center text-xs font-semibold text-emerald-300 group-hover:text-emerald-200">
                        Deschide
                        <span className="ml-1 transition-transform group-hover:translate-x-0.5">
                          ↗
                        </span>
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </div>

          {/* COL DREAPTA: SIDEBAR SUMMARY */}
          <motion.aside
            className="space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            {/* Card status */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-md shadow-slate-950/60">
              <h2 className="mb-2 text-sm font-semibold text-slate-100">
                Rezumat rapid
              </h2>
              <ul className="space-y-1.5 text-xs text-slate-300">
                <li>• Notificări WhatsApp active pentru evenimente.</li>
                <li>• Programul este actualizat automat din Supabase.</li>
                <li>• Echipele sunt sincronizate cu leaderboard-ul.</li>
              </ul>
            </div>

            {/* Card „Stay on track” */}
            <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/40 p-4">
              <h2 className="mb-2 text-sm font-semibold text-slate-100">
                Stay on track
              </h2>
              <p className="text-xs text-slate-300">
                Încearcă să verifici leaderboard-ul după fiecare milestone și
                ține-ți echipa la curent cu modificările din program.
              </p>
              <div className="mt-3 flex gap-2 text-[11px]">
                <LinkChip href="/leaderboard">🏆 Deschide leaderboard</LinkChip>
                <LinkChip href="/schedule">🕒 Timeline complet</LinkChip>
              </div>
            </div>

            {/* Admin zone */}
            {isAdmin && (
              <div className="rounded-2xl border border-emerald-500/50 bg-emerald-500/5 p-4 shadow-[0_0_25px_rgba(16,185,129,0.25)]">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-emerald-100">
                    Zona de admin
                  </h2>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                    doar pentru tine
                  </span>
                </div>
                <p className="mb-3 text-xs text-emerald-100/80">
                  Administrează programul, proiectele și punctele. Aceste
                  acțiuni afectează toți participanții.
                </p>

                <div className="grid gap-2 text-xs">
                  {adminLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group flex items-center justify-between rounded-lg border border-emerald-500/40 bg-emerald-500/5 px-3 py-2 transition hover:bg-emerald-500/15"
                    >
                      <div className="flex items-center gap-2">
                        <span>{link.icon}</span>
                        <div>
                          <p className="font-semibold text-emerald-50">
                            {link.label}
                          </p>
                          <p className="text-[10px] text-emerald-100/80">
                            {link.description}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-200 group-hover:translate-x-0.5 transition-transform">
                        ↗
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      </motion.div>
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
    "inline-flex items-center rounded-full px-3 py-1 text-[11px] border";
  const styles =
    variant === "admin"
      ? "border-amber-400/40 bg-amber-500/10 text-amber-200"
      : "border-slate-700 bg-slate-900/80 text-slate-200";

  return <span className={`${base} ${styles}`}>{children}</span>;
}

function LinkChip({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] text-slate-200 hover:border-emerald-400/70 hover:text-emerald-200"
    >
      {children}
    </Link>
  );
}

function SkeletonLine({ width = "100%" }: { width?: string }) {
  return (
    <div
      className="h-3 rounded-full bg-slate-800/80 animate-pulse"
      style={{ width }}
    />
  );
}
