"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Team = {
  id: number;
  name: string;
  track: string | null;
  description: string | null;
  creator_id: string | null;
};

export default function TeamsPage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadTeam = async () => {
      setLoading(true);
      setErrorMsg(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorMsg("Trebuie să fii logat ca să vezi echipa.");
        setLoading(false);
        return;
      }

      // 1) vezi dacă a creat o echipă
      const { data: createdTeam, error: createdErr } = await supabase
        .from("teams")
        .select("id, name, track, description, creator_id")
        .eq("creator_id", user.id)
        .maybeSingle();

      if (createdErr && (createdErr as any).code !== "PGRST116") {
        console.error(createdErr);
      }

      let finalTeam: Team | null = (createdTeam as any) || null;
      let creatorFlag = !!createdTeam;

      // 2) dacă NU a creat, vezi dacă e membru într-una
      if (!finalTeam) {
        const { data: memberRow, error: memberErr } = await supabase
          .from("team_members")
          .select("team_id")
          .eq("profile_id", user.id)
          .eq("role", "member")
          .maybeSingle();

        if (memberErr && (memberErr as any).code !== "PGRST116") {
          console.error(memberErr);
        }

        if (memberRow) {
          const { data: teamData, error: teamErr } = await supabase
            .from("teams")
            .select("id, name, track, description, creator_id")
            .eq("id", (memberRow as any).team_id)
            .maybeSingle();

          if (teamErr && (teamErr as any).code !== "PGRST116") {
            console.error(teamErr);
          }

          if (teamData) {
            finalTeam = teamData as Team;
            creatorFlag = (teamData as any).creator_id === user.id;
          }
        }
      }

      setTeam(finalTeam);
      setIsCreator(creatorFlag);
      setLoading(false);
    };

    loadTeam();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* HERO */}
      <section className="relative border-b border-slate-800/60">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-500/15 via-slate-950 to-slate-950" />
        <div className="relative mx-auto max-w-5xl px-4 py-12">
          <h1 className="text-center text-3xl font-bold md:text-4xl">
            Echipa mea
          </h1>
          <p className="mt-3 text-center text-sm text-slate-300 max-w-xl mx-auto">
            Un participant poate fi doar într-o singură echipă. Aici vezi
            informațiile despre echipa ta și acțiunile pe care le poți face.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="relative mx-auto max-w-4xl px-4 py-8">
        {loading && (
          <p className="text-sm text-slate-300">Se încarcă informațiile...</p>
        )}

        {!loading && errorMsg && (
          <p className="text-sm text-red-400">{errorMsg}</p>
        )}

        {!loading && !errorMsg && !team && (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/70 p-6 flex flex-col items-center text-center gap-3">
            <div className="text-3xl">👥</div>
            <h2 className="text-lg font-semibold">Nu ai încă o echipă</h2>
            <p className="text-sm text-slate-300 max-w-md">
              Creează o echipă nouă și invită-ți colegii sau așteaptă să fii
              invitat într-o echipă existentă.
            </p>
            <Link
              href="/teams/new"
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/40 hover:bg-emerald-400"
            >
              ➕ Creează o echipă
            </Link>
          </div>
        )}

        {!loading && !errorMsg && team && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm shadow-slate-900/50">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-200 uppercase tracking-[0.16em]">
                    {isCreator ? "Team Owner" : "Team Member"}
                  </div>
                  <h2 className="text-xl font-semibold mt-1">{team.name}</h2>
                  {team.track && (
                    <p className="text-sm text-emerald-300">
                      Track: {team.track}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <Link
                    href={`/teams/${team.id}/project`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-semibold text-slate-100 hover:border-emerald-400 hover:text-emerald-200"
                  >
                    📁 Proiectul echipei
                  </Link>
                  <Link
                    href={`/teams/${team.id}/mentoring`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-semibold text-slate-100 hover:border-sky-400 hover:text-sky-200"
                  >
                    🧠 Mentorat
                  </Link>
                  {isCreator && (
                    <Link
                      href={`/teams/${team.id}/project`}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 font-semibold text-slate-950 hover:bg-emerald-400"
                    >
                      ✏️ Editează proiectul
                    </Link>
                  )}
                </div>
              </div>

              {team.description && (
                <p className="mt-4 text-sm text-slate-200">
                  {team.description}
                </p>
              )}

              <p className="mt-3 text-xs text-slate-400">
                Tu ești{" "}
                {isCreator
                  ? "creatorul acestei echipe și poți edita proiectul și detaliile."
                  : "membru în această echipă. Doar creatorul o poate edita."}
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
