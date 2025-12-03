"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type ProfileRow = {
  id: string;
  full_name: string | null;
  role: string | null;
  skills: string[] | string | null;
  looking_status: string | null;
  links:
    | {
        github?: string | null;
        linkedin?: string | null;
      }
    | null;
  phone_number: string | null;
  whatsapp_opt_in: boolean | null;
};

export default function OnboardingPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [skills, setSkills] = useState("");
  const [lookingStatus, setLookingStatus] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);

  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1️⃣ Încarcă profilul existent la mount
  useEffect(() => {
    const loadProfile = async () => {
      setLoadingProfile(true);
      setErrorMsg(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.log("Onboarding: no user", userError);
        setErrorMsg("Nu ești logat.");
        setLoadingProfile(false);
        return;
      }

      console.log("Onboarding: current user id =", user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, full_name, role, skills, looking_status, links, phone_number, whatsapp_opt_in"
        )
        .eq("id", user.id)
        .maybeSingle();

      console.log("Onboarding: loaded profile =", { data, error });

      if (error) {
        // Dacă nu există rând (cod PGRST116) nu e grav, lăsăm câmpurile goale
        if ((error as any).code !== "PGRST116") {
          console.error("Supabase profile error:", error);
          setErrorMsg("Nu am putut încărca profilul.");
        }
      } else if (data) {
        const p = data as ProfileRow;

        setFullName(p.full_name ?? "");

        if (Array.isArray(p.skills)) {
          setSkills(p.skills.join(", "));
        } else if (typeof p.skills === "string") {
          setSkills(p.skills);
        } else {
          setSkills("");
        }

        setLookingStatus(p.looking_status ?? "");

        const links = p.links || {};
        setGithub(links.github ?? "");
        setLinkedin(links.linkedin ?? "");

        setPhone(p.phone_number ?? "");
        setWhatsappOptIn(p.whatsapp_opt_in ?? false);
      }

      setLoadingProfile(false);
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setErrorMsg("Nu ești logat.");
      setSaving(false);
      return;
    }

    const payload = {
      id: user.id,
      full_name: fullName,
      role: "participant",
      skills: skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
      looking_status: lookingStatus,
      links: {
        github,
        linkedin,
      },
      phone_number: phone || null,
      whatsapp_opt_in: whatsappOptIn,
    };

    console.log("Onboarding: saving payload =", payload);

    const { error } = await supabase.from("profiles").upsert(payload);

    if (error) {
      console.error(error);
      setErrorMsg("A apărut o eroare la salvare.");
      setSaving(false);
      return;
    }

    router.push("/dashboard");
  };

  const disabled = saving || loadingProfile;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* BG glow */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.16),_transparent_55%)]" />

      {/* HERO */}
      <section className="relative border-b border-slate-800/60">
        <div className="relative mx-auto max-w-5xl px-4 py-10 md:py-14 flex flex-col md:flex-row gap-8 md:items-center">
          <div className="space-y-4 md:flex-1">
            <p className="text-xs uppercase tracking-[0.25em] text-indigo-300/80">
              onboarding profil
            </p>
            <h1 className="text-3xl md:text-4xl font-bold">
              Spune-ne cine ești{" "}
              <span className="text-indigo-400">ca să-ți găsești echipa</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Folosim aceste informații pentru a-ți găsi mai ușor echipă,
              mentori și pentru a-ți trimite notificări înainte de sesiuni.
              Poți actualiza profilul oricând.
            </p>

            <div className="flex flex-wrap gap-3 text-xs text-slate-300">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Profil folosit la echipe & matche-uri
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                WhatsApp reminders opționale
              </div>
            </div>
          </div>

          <div className="hidden md:flex md:flex-1 md:justify-end">
            <div className="relative">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-indigo-500/40 via-emerald-400/30 to-sky-500/30 blur-xl opacity-70" />
              <div className="relative rounded-3xl border border-slate-800 bg-slate-950/80 px-5 py-4 text-xs text-slate-200 space-y-2 shadow-[0_0_40px_rgba(15,23,42,0.9)]">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-slate-400">
                    LIVE PROFILE PREVIEW
                  </span>
                  <span className="text-[10px] text-emerald-300">
                    {fullName || "Participant nou"}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] text-slate-300">
                    Skills:{" "}
                    <span className="text-slate-100">
                      {skills || "ex: React, AI, UI/UX"}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Status:{" "}
                    <span className="text-slate-100">
                      {lookingStatus || "ex: Caut echipă AI"}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-300">
                    WhatsApp:{" "}
                    <span className={whatsappOptIn ? "text-emerald-300" : "text-slate-400"}>
                      {whatsappOptIn ? "activat pentru remindere" : "dezactivat"}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2 text-[10px]">
                  {github && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2 py-0.5 border border-slate-700">
                      <span></span>
                      <span>GitHub conectat</span>
                    </span>
                  )}
                  {linkedin && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2 py-0.5 border border-slate-700">
                      <span>🔗</span>
                      <span>LinkedIn conectat</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FORM SECTION */}
      <section className="relative mx-auto max-w-4xl px-4 py-8 md:py-10">
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-6 md:px-7 md:py-7 shadow-[0_0_35px_rgba(15,23,42,0.85)]">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-lg font-semibold">
                Completează / actualizează profilul
              </h2>
              <p className="text-xs text-slate-400">
                Datele existente sunt încărcate automat. Modifică ce vrei și
                apasă „Salvează profilul”.
              </p>
            </div>

            {loadingProfile && (
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] text-slate-300">
                <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                Se încarcă profilul...
              </span>
            )}
          </div>

          <div className="space-y-4">
            {/* Nume & telefon */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Nume complet
                </label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 disabled:opacity-60"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={disabled}
                  placeholder="ex: Andrei Popescu"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Telefon (WhatsApp)
                </label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 disabled:opacity-60"
                  placeholder="+40712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={disabled}
                />
                <p className="text-[11px] text-slate-500">
                  Folosește format internațional, ex. +40712345678.
                </p>
              </div>
            </div>

            {/* WhatsApp opt-in */}
            <label className="flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900"
                checked={whatsappOptIn}
                onChange={(e) => setWhatsappOptIn(e.target.checked)}
                disabled={disabled}
              />
              <div className="space-y-0.5">
                <p className="font-medium text-slate-100">
                  Vreau să primesc notificări pe WhatsApp
                </p>
                <p className="text-xs text-slate-400">
                  Reminder cu 5 minute înainte de evenimente & sesiuni la care
                  particip, pe numărul introdus mai sus.
                </p>
              </div>
            </label>

            {/* Skills & status */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Skills (separate prin virgulă)
              </label>
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 disabled:opacity-60"
                placeholder="ex: React, Node, UI/UX, Data Science"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                disabled={disabled}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Status (cauți echipă? ai echipă?)
              </label>
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 disabled:opacity-60"
                placeholder="ex: Caut echipă AI, am echipă și căutăm designer..."
                value={lookingStatus}
                onChange={(e) => setLookingStatus(e.target.value)}
                disabled={disabled}
              />
            </div>

            {/* Link-uri */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  GitHub
                </label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 disabled:opacity-60"
                  placeholder="https://github.com/..."
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  disabled={disabled}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  LinkedIn
                </label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 disabled:opacity-60"
                  placeholder="https://linkedin.com/in/..."
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  disabled={disabled}
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-sm text-red-400 border border-red-500/40 bg-red-900/20 rounded-md px-3 py-2">
                {errorMsg}
              </p>
            )}

            <div className="pt-2">
              <button
                onClick={handleSave}
                disabled={disabled}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_25px_rgba(129,140,248,0.6)] transition hover:bg-indigo-400 disabled:opacity-60 disabled:shadow-none"
              >
                {saving ? (
                  <>
                    <span className="h-3 w-3 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                    <span>Se salvează...</span>
                  </>
                ) : (
                  <>Salvează profilul</>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
