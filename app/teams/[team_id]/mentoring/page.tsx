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
  links: {
    github?: string | null;
    linkedin?: string | null;
  } | null;
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

  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-950 text-white">
      <div className="w-full max-w-lg space-y-4 p-6 border border-slate-800 rounded-lg bg-slate-900">
        <h1 className="text-2xl font-bold mb-2">Completează profilul</h1>
        <p className="text-sm text-slate-400 mb-4">
          Datele tale existente sunt încărcate automat. Modifică ce vrei și
          apasă „Salvează profilul”.
        </p>

        {loadingProfile && (
          <p className="text-sm text-slate-400">Se încarcă profilul...</p>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium">Nume complet</label>
          <input
            className="border border-slate-700 bg-slate-800 p-2 w-full rounded"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Telefon (WhatsApp)</label>
          <input
            className="border border-slate-700 bg-slate-800 p-2 w-full rounded"
            placeholder="+40712345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <p className="text-xs text-slate-400">
            Folosește format internațional, ex. +40712345678.
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={whatsappOptIn}
            onChange={(e) => setWhatsappOptIn(e.target.checked)}
          />
          Vreau să primesc notificări pe WhatsApp (reminder înainte de
          eveniment).
        </label>

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Skills (separate prin virgulă)
          </label>
          <input
            className="border border-slate-700 bg-slate-800 p-2 w-full rounded"
            placeholder="ex: React, Node, UI/UX"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Status (cauți echipă? ai echipă?)
          </label>
          <input
            className="border border-slate-700 bg-slate-800 p-2 w-full rounded"
            placeholder="ex: Caut echipă AI"
            value={lookingStatus}
            onChange={(e) => setLookingStatus(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">GitHub</label>
          <input
            className="border border-slate-700 bg-slate-800 p-2 w-full rounded"
            placeholder="https://github.com/..."
            value={github}
            onChange={(e) => setGithub(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">LinkedIn</label>
          <input
            className="border border-slate-700 bg-slate-800 p-2 w-full rounded"
            placeholder="https://linkedin.com/in/..."
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
          />
        </div>

        {errorMsg && <p className="text-sm text-red-400">{errorMsg}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full p-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60"
        >
          {saving ? "Se salvează..." : "Salvează profilul"}
        </button>
      </div>
    </div>
  );
}
