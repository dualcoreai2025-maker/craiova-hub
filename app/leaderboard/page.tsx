"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Team = {
  id: string;
  name: string;
  track: string | null;
  points: number;
};

export default function LeaderboardPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("teams")
        .select("id, name, track, points")
        .order("points", { ascending: false });

      console.log("loadLeaderboard:", { data, error });

      if (error) {
        setErrorMsg(error.message);
        setTeams([]);
      } else {
        setTeams((data || []) as Team[]);
      }

      setLoading(false);
    };

    loadLeaderboard();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-slate-300 text-sm">
          Clasamentul echipelor după puncte.
        </p>

        {loading && <p>Se încarcă leaderboard-ul...</p>}

        {!loading && errorMsg && (
          <p className="text-red-400 text-sm">
            Eroare la încărcarea datelor: {errorMsg}
          </p>
        )}

        {!loading && !errorMsg && teams.length === 0 && (
          <p className="text-slate-400 text-sm">
            Nu există încă echipe cu puncte.
          </p>
        )}

        {!loading && !errorMsg && teams.length > 0 && (
          <div className="space-y-2">
            {teams.map((team, index) => (
              <div
                key={team.id}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold w-8 text-right">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{team.name}</p>
                    {team.track && (
                      <p className="text-xs uppercase text-slate-400">
                        Track: {team.track}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-400">
                    {team.points}p
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
