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

  const getRankStyle = (index: number) => {
    if (index === 0) {
      return {
        badge: "bg-yellow-400 text-slate-950",
        border: "border-yellow-400/70",
        glow: "shadow-[0_0_30px_rgba(250,204,21,0.25)]",
        label: "🥇 Locul 1",
      };
    }
    if (index === 1) {
      return {
        badge: "bg-slate-200 text-slate-900",
        border: "border-slate-400/60",
        glow: "shadow-[0_0_26px_rgba(148,163,184,0.25)]",
        label: "🥈 Locul 2",
      };
    }
    if (index === 2) {
      return {
        badge: "bg-amber-700 text-amber-50",
        border: "border-amber-500/70",
        glow: "shadow-[0_0_26px_rgba(245,158,11,0.25)]",
        label: "🥉 Locul 3",
      };
    }
    return {
      badge: "bg-slate-800 text-slate-100",
      border: "border-slate-800",
      glow: "",
      label: `#${index + 1}`,
    };
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* BG glow */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(34,197,94,0.16),_transparent_55%)]" />

      {/* HERO */}
      <section className="relative border-b border-slate-800/60">
        <div className="relative mx-auto max-w-5xl px-4 py-10 md:py-14 space-y-4">
          <p className="text-xs uppercase tracking-[0.25em] text-indigo-300/80">
            live ranking
          </p>
          <h1 className="text-3xl md:text-4xl font-bold">
            Leaderboard{" "}
            <span className="text-emerald-400">echipe</span>
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Vezi clasamentul echipelor în funcție de punctaj. Top 3 sunt evidențiate,
            dar fiecare punct contează în drumul spre premiu.
          </p>

          <div className="flex flex-wrap gap-3 text-xs text-slate-300 mt-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Punctaj actualizat de juriu / mentori
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              Un singur clasament pentru toate track-urile
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
            Nu există încă echipe cu puncte. Clasamentul va apărea pe măsură ce
            echipele sunt evaluate de către juriu.
          </div>
        )}

        {!loading && !errorMsg && teams.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                {teams.length} echip
                {teams.length === 1 ? "ă" : "e"} în clasament
              </p>
            </div>

            <div className="space-y-2">
              {teams.map((team, index) => {
                const rank = getRankStyle(index);

                return (
                  <article
                    key={team.id}
                    className={`flex items-center justify-between rounded-2xl border bg-slate-900/80 px-4 py-3 shadow-sm shadow-slate-950/60 transition ${rank.border} ${rank.glow} hover:bg-slate-900`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${rank.badge}`}
                      >
                        {index <= 2 ? rank.label.split(" ")[0] : `#${index + 1}`}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-50">
                          {team.name}
                        </p>
                        <div className="flex flex-wrap gap-2 items-center mt-0.5">
                          {team.track && (
                            <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-100 border border-slate-700">
                              Track: {team.track}
                            </span>
                          )}
                          {index <= 2 && (
                            <span className="text-[11px] text-slate-400">
                              {rank.label}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-400">
                        {team.points}p
                      </p>
                      <p className="text-[11px] text-slate-500">
                        punctaj total
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
