"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [skills, setSkills] = useState("");
  const [lookingStatus, setLookingStatus] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");

  // 👇 noi
  const [phone, setPhone] = useState("");
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg(null);

    // Obține user-ul logat
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setErrorMsg("Nu ești logat.");
      setSaving(false);
      return;
    }

    // Pregătim payload-ul pentru profil
    const payload = {
      id: user.id,
      full_name: fullName,
      role: "participant", // setat AUTOMAT
      skills: skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
      looking_status: lookingStatus,
      links: {
        github,
        linkedin,
      },
      // 👇 câmpurile noi pentru WhatsApp
      phone_number: phone || null,
      whatsapp_opt_in: whatsappOptIn,
    };

    // Salvăm în Supabase
    const { error } = await supabase.from("profiles").upsert(payload);

    if (error) {
      console.error(error);
      setErrorMsg("A apărut o eroare la salvare.");
      setSaving(false);
      return;
    }

    // Redirect după salvare
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-950 text-white">
      <div className="w-full max-w-lg space-y-4 p-6 border border-slate-800 rounded-lg bg-slate-900">
        <h1 className="text-2xl font-bold mb-4">Completează profilul</h1>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Nume complet</label>
          <input
            className="border border-slate-700 bg-slate-800 p-2 w-full rounded"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        {/* Telefon + opt-in WhatsApp */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Telefon (WhatsApp)
          </label>
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

        {/* Rolul nu mai apare în UI */}

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
          className="w-full p-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {saving ? "Se salvează..." : "Salvează profilul"}
        </button>
      </div>
    </div>
  );
}
