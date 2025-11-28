"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminRoute from "@/components/AdminRoute";

type Team = {
  id: string;
  name: string;
  points: number | null;
};

/* ─────────────────────────────────────────────
   Logica paginii – se rulează DOAR dacă AdminRoute permite
────────────────────────────────────────────── */
function AdminPointsInnerPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [pointsDelta, setPointsDelta] = useState<number>(10);
  const [reason, setReason] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // încarcă echipele
  const loadTeams = async () => {
    setLoading(true);
    setErrorMsg(null);

    const { data, error } = await supabase
      .from("teams")
      .select("id, name, points")
      .order("name", { ascending: true });

    if (error) {
      console.error("loadTeams error:", error);
      setErrorMsg("Nu am putut încărca echipele (teams).");
      setTeams([]);
    } else {
      const rows = (data ?? []) as Team[];
      setTeams(rows);
      if (rows.length > 0) {
        setSelectedTeamId(rows[0].id);
      }
    }

    // verificăm rapid dacă points_log există (doar pentru debug)
    const { error: logError } = await supabase
      .from("points_log")
      .select("id")
      .limit(1);

    if (logError) {
      console.warn("points_log error (nu blochează pagina):", logError);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const handleSavePoints = async () => {
    if (!selectedTeamId) return;

    setSaving(true);
    setErrorMsg(null);

    const team = teams.find((t) => t.id === selectedTeamId);
    const currentPoints = team?.points ?? 0;
    const newPoints = currentPoints + pointsDelta;

    // 1. inserăm în points_log
    const { error: logError } = await supabase.from("points_log").insert({
      team_id: selectedTeamId,
      points: pointsDelta,
      reason: reason || null,
    });

    if (logError) {
      console.error("insert points_log error:", logError);
      setErrorMsg(logError.message);
      setSaving(false);
      return;
    }

    // 2. actualizăm coloana points în teams
    const { error: updateError } = await supabase
      .from("teams")
      .update({ points: newPoints })
      .eq("id", selectedTeamId);

    if (updateError) {
      console.error("update teams.points error:", updateError);
      setErrorMsg(updateError.message);
      setSaving(false);
      return;
    }

    await loadTeams();
    setSaving(false);
    setReason("");
  };

  const sortedTeams = [...teams].sort(
    (a, b) => (b.points ?? 0) - (a.points ?? 0)
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
        {/* FORM PUNCTE */}
        <section>
          <h1 className="text-xl font-bold mb-2">Adaugă puncte</h1>
          {errorMsg && (
            <p className="text-red-400 text-sm mb-3">{errorMsg}</p>
          )}

          {loading ? (
            <p>Se încarcă echipele...</p>
          ) : teams.length === 0 ? (
            <p>Nu există echipe în baza de date.</p>
          ) : (
            <div className="space-y-3">
              {/* Select echipă */}
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Echipa</label>
                <select
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                >
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} ({team.points ?? 0} puncte)
                    </option>
                  ))}
                </select>
              </div>

              {/* Puncte */}
              <div className="space-y-1">
                <label className="text-sm text-slate-300">
                  Puncte (+5, -3, 10, etc.)
                </label>
                <input
                  type="number"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
                  value={pointsDelta}
                  onChange={(e) => setPointsDelta(Number(e.target.value))}
                />
              </div>

              {/* Motiv */}
              <div className="space-y-1">
                <label className="text-sm text-slate-300">
                  Motiv (opțional)
                </label>
                <input
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
                  placeholder="Ex: Premiu pentru demo, penalizare pentru întârziere..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <button
                onClick={handleSavePoints}
                disabled={saving || !selectedTeamId}
                className="mt-2 px-4 py-2 rounded bg-indigo-600 text-white text-sm font-medium disabled:opacity-50"
              >
                {saving ? "Se salvează..." : "Salvează puncte"}
              </button>
            </div>
          )}
        </section>

        {/* LEADERBOARD */}
        <section>
          <h2 className="text-xl font-bold mb-2">Leaderboard echipe</h2>

          {loading ? (
            <p>Se încarcă...</p>
          ) : sortedTeams.length === 0 ? (
            <p>Nu există echipe în baza de date.</p>
          ) : (
            <ul className="space-y-2">
              {sortedTeams.map((team, idx) => (
                <li
                  key={team.id}
                  className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm"
                >
                  <span>
                    <span className="text-slate-500 mr-2">#{idx + 1}</span>
                    {team.name}
                  </span>
                  <span className="font-semibold">
                    {team.points ?? 0}p
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

/* ─────────────────────────────────────────────
   Export final protejat cu AdminRoute
────────────────────────────────────────────── */
export default function AdminPointsPage() {
  return (
    <AdminRoute>
      <AdminPointsInnerPage />
    </AdminRoute>
  );
}
