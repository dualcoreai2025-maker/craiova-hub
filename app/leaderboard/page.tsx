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

  const renderPlaceBadge = (index: number) => {
    if (index === 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400/10 px-2 py-0.5 text-[11px] font-semibold text-yellow-300 border border-yellow-400/60">
          🥇 Locul 1
        </span>
      );
    }
    if (index === 1) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-200/5 px-2 py-0.5 text-[11px] font-semibold text-slate-100 border border-slate-300/40">
          🥈 Locul 2
        </span>
      );
    }
    if (index === 2) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-700/20 px-2 py-0.5 text-[11px] font-semibold text-orange-200 border border-amber-500/60">
          🥉 Locul 3
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-slate-200 border border-slate-700/80">
        #{index + 1}
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* BG glow */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(52,211,153,0.16),_transparent_55%)]" />

      {/* HERO */}
      <section className="relative border-b border-slate-800/60">
        <div className="relative mx-auto max-w-5xl px-4 py-10 md:py-14 space-y-4">
          <p className="text-xs uppercase tracking-[0.25em] text-indigo-300/80">
            live ranking
          </p>
          <h1 className="text-3xl md:text-4xl font-bold">
            Leaderboard{" "}
            <span className="text-emerald-400">echipe participante</span>
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Vezi clasamentul echipelor în funcție de punctaj. Pozițiile
            superioare sunt evidențiate, astfel încât să urmărești ușor
            competiția.
          </p>

          <div className="flex flex-wrap gap-3 text-xs text-slate-300 mt-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Puncte cumulate pe parcursul hackathon-ului
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              Actualizări în funcție de jurizare & challenge-uri
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="relative mx-auto max-w-4xl px-4 py-8 md:py-10 space-y-4">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <span className="h-3 w-3 rounded-full border-2 border-slate-500 border-t-transparent animate-spin" />
            <span>Se încarcă leaderboard-ul...</span>
          </div>
        )}

        {!loading && errorMsg && (
          <p className="text-sm text-red-400 border border-red-500/40 bg-red-900/20 rounded-md px-3 py-2">
            Eroare la încărcarea datelor: {errorMsg}
          </p>
        )}

        {!loading && !errorMsg && teams.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/70 px-5 py-6 text-sm text-slate-300">
            Nu există încă echipe cu puncte în leaderboard. Clasamentul se va
            popula pe măsură ce se acordă puncte în timpul hackathon-ului.
          </div>
        )}

        {!loading && !errorMsg && teams.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                {teams.length} echip
                {teams.length === 1 ? "ă" : "e"} în clasament
              </p>
            </div>

            <div className="space-y-2">
              {teams.map((team, index) => {
                const isTop3 = index < 3;

                return (
                  <article
                    key={team.id}
                    className={
                      "flex items-center justify-between rounded-2xl border px-4 py-3 md:px-5 md:py-4 bg-slate-900/80 shadow-sm shadow-slate-950/60 transition " +
                      (isTop3
                        ? "border-emerald-400/50 bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-900/20"
                        : "border-slate-800 hover:border-indigo-400/70")
                    }
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center gap-1 w-10">
                        <span className="text-lg font-bold text-slate-100">
                          #{index + 1}
                        </span>
                        {renderPlaceBadge(index)}
                      </div>

                      <div className="space-y-0.5">
                        <p className="font-semibold text-sm md:text-base">
                          {team.name}
                        </p>
                        {team.track && (
                          <p className="text-[11px] uppercase text-slate-400 tracking-wide">
                            Track: {team.track}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg md:text-xl font-bold text-emerald-400">
                        {team.points}
                        <span className="text-xs text-emerald-300 ml-1">
                          puncte
                        </span>
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
