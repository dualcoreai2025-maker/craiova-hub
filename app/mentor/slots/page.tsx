"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function MentorSlotsPage() {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateSlot = async () => {
    setMessage(null);
    setError(null);

    // 1. userul curent
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!user || userError) {
      setError("Trebuie să fii logat ca mentor.");
      return;
    }

    // 2. profilul din tabela profiles (mentor_id = profiles.id)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!profile || profileError) {
      setError("Nu am găsit profilul tău de mentor.");
      return;
    }

    if (!startTime || !endTime) {
      setError("Completează start și end time.");
      return;
    }

    // 3. insert în mentoring_slots
    const { error: insertError } = await supabase
      .from("mentoring_slots")
      .insert({
        mentor_id: profile.id,
        start_time: startTime,
        end_time: endTime,
        // is_booked rămâne false by default
      });

    if (insertError) {
      setError(insertError.message);
    } else {
      setMessage("Slot creat cu succes!");
      setStartTime("");
      setEndTime("");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-lg mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Mentor – Creează sloturi</h1>

        <label className="block text-sm">
          Start time
          <input
            type="datetime-local"
            className="mt-1 w-full border rounded bg-slate-900 p-2"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </label>

        <label className="block text-sm">
          End time
          <input
            type="datetime-local"
            className="mt-1 w-full border rounded bg-slate-900 p-2"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </label>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {message && <p className="text-emerald-400 text-sm">{message}</p>}

        <button
          onClick={handleCreateSlot}
          className="px-4 py-2 rounded bg-indigo-600 text-white"
        >
          Creează slot
        </button>
      </div>
    </main>
  );
}
