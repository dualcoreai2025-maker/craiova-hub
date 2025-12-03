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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* BG glow global */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.22),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.18),_transparent_55%)]" />

      {/* HERO / HEADER DASHBOARD */}
      <section className="relative overflow-hidden border-b border-slate-800/60">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-sky-500/10 to-indigo-500/20" />

        <motion.div
          className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-16 pt-16 md:flex-row md:items-center md:pb-20 md:pt-20"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* LEFT SIDE: TEXT */}
          <div className="flex-1 space-y-4">
            <motion.span
              className="inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.23em] text-emerald-300"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              Dashboard · Craiova Hackathon
            </motion.span>

            <motion.h1
              className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.45 }}
            >
              Salut
              {profile?.full_name ? `, ${profile.full_name}` : ""}! 👋
              <br />
              Bine ai venit în hub-ul tău de{" "}
              <span className="bg-gradient-to-r from-emerald-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                hackathon.
              </span>
            </motion.h1>

            <motion.p
              className="max-w-xl text-sm text-slate-300 md:text-base"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              De aici accesezi tot ce ai nevoie: program, echipă, mentoring,
              resurse și leaderboard. Dacă ești admin, ai și un meniu dedicat de
              administrare.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-3 text-xs text-slate-300 md:text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.35 }}
            >
              <Chip>💻 48h de coding & colaborare</Chip>
              <Chip>🏆 Premii & mentorship</Chip>
              {isAdmin && <Chip variant="admin">🛠️ Mod admin activ</Chip>}
            </motion.div>
          </div>

          {/* RIGHT SIDE: CARD STATUS PROFIL */}
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: 22 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.45 }}
          >
            <div className="relative mx-auto mt-4 max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-[0_0_40px_rgba(16,185,129,0.35)] backdrop-blur-sm md:mt-0">
              <div className="mb-3 flex items-center justify-between text-[11px] text-slate-400">
                <span>Starea contului</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  notificări WhatsApp
                </span>
              </div>

              {loading ? (
                <div className="space-y-2">
                  <SkeletonLine />
                  <SkeletonLine width="70%" />
                  <SkeletonLine width="50%" />
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
                  <p className="text-xs text-slate-400">
                    Poți actualiza telefonul și preferințele de notificare din
                    pagina de Onboarding/Profil.
                  </p>
                  <Link
                    href="/onboarding"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 hover:text-emerald-200"
                  >
                    → Actualizează profilul
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-slate-300">
                  Nu am găsit profilul tău. Încearcă să refaci onboarding-ul.
                </p>
              )}

              {/* mini „sparkline” decorativ jos */}
              <div className="mt-4 h-8 w-full overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
                <div className="flex h-full w-full items-center gap-1 px-2">
                  <span className="h-3 w-1 rounded-full bg-emerald-500/60" />
                  <span className="h-2 w-1 rounded-full bg-sky-400/70" />
                  <span className="h-4 w-1 rounded-full bg-indigo-400/70" />
                  <span className="h-2 w-1 rounded-full bg-emerald-400/50" />
                  <span className="h-3 w-1 rounded-full bg-sky-500/60" />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* MENIU UTILIZATOR */}
      <section className="border-b border-slate-800/60 bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-lg font-semibold">Zona ta de participant</h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              Alege unde vrei să mergi: vezi programul, lucrează cu echipa ta,
              verifică leaderboard-ul sau accesează resursele și notificările.
            </p>
          </motion.div>

          <motion.div
            className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: {
                opacity: 1,
                y: 0,
                transition: {
                  staggerChildren: 0.06,
                },
              },
            }}
          >
            {userLinks.map((link) => (
              <motion.div
                key={link.href}
                variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
              >
                <Link
                  href={link.href}
                  className="group flex h-full flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm shadow-sm shadow-slate-900/40 transition hover:-translate-y-1 hover:border-emerald-400/70 hover:bg-slate-900"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-xl">{link.icon}</span>
                    <h3 className="font-semibold">{link.label}</h3>
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
          </motion.div>
        </div>
      </section>

      {/* MENIU ADMIN – doar pentru admini */}
      {isAdmin && (
        <section className="bg-slate-950">
          <motion.div
            className="mx-auto max-w-6xl px-4 py-10 space-y-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.45 }}
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                Zona de administrare
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  doar pentru admini
                </span>
              </h2>
            </div>
            <p className="max-w-2xl text-sm text-slate-400">
              De aici poți gestiona programul, proiectele, punctajele, resursele
              și utilizatorii. Accesul este limitat la conturile cu rol de
              admin.
            </p>

            <motion.div
              className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    staggerChildren: 0.06,
                  },
                },
              }}
            >
              {adminLinks.map((link) => (
                <motion.div
                  key={link.href}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0 },
                  }}
                >
                  <Link
                    href={link.href}
                    className="group flex h-full flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-sm shadow-sm shadow-emerald-900/30 transition hover:-translate-y-1 hover:border-emerald-400/70 hover:bg-slate-900"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-xl">{link.icon}</span>
                      <h3 className="font-semibold">{link.label}</h3>
                    </div>
                    <p className="mb-3 text-xs text-slate-400">
                      {link.description}
                    </p>
                    <span className="mt-auto inline-flex items-center text-xs font-semibold text-emerald-300 group-hover:text-emerald-200">
                      Intră în panou
                      <span className="ml-1 transition-transform group-hover:translate-x-0.5">
                        ↗
                      </span>
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>
      )}
    </main>
  );
}

// mic helper pentru „chip”-urile din header
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

// skeleton simplu pentru loading profil
function SkeletonLine({ width = "100%" }: { width?: string }) {
  return (
    <div
      className="h-3 rounded-full bg-slate-800/80 animate-pulse"
      style={{ width }}
    />
  );
}
