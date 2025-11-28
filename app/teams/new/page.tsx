"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function NewTeamPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [track, setTrack] = useState("");
  const [error, setError] = useState("");

  const handleCreate = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Nu ești logat.");
      return;
    }

    // 🔥 Generează cod de invitație
    const inviteCode = crypto.randomUUID().slice(0, 8);

    const { data: team, error: teamError } = await supabase
      .from("teams")
      .insert({
        name,
        description,
        track,
        invite_code: inviteCode,   // 🔥 AICI SE ADAUGĂ
        created_by: user.id,
      })
      .select()
      .single();

    if (teamError) {
      setError(teamError.message);
      return;
    }

    // Adaugă automat liderul în team_members
    await supabase.from("team_members").insert({
      team_id: team.id,
      user_id: user.id,
      role: "leader",
    });

    router.push(`/teams/${team.id}`);
  };

  return (
    <div className="max-w-lg mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Creează echipă</h1>

      <input
        className="border p-2 w-full"
        placeholder="Nume echipă"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <textarea
        className="border p-2 w-full"
        placeholder="Descriere"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        className="border p-2 w-full"
        placeholder="Track (AI, Web, Game, etc.)"
        value={track}
        onChange={(e) => setTrack(e.target.value)}
      />

      {error && <p className="text-red-600">{error}</p>}

      <button
        onClick={handleCreate}
        className="px-4 py-2 bg-black text-white rounded"
      >
        Creează echipa
      </button>
    </div>
  );
}
