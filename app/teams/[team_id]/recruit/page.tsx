"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Team = {
  id: string;
  name: string;
  creator_id: string | null;
};

type Profile = {
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
};

// helper: normalizează skills în array de string-uri
function normalizeSkills(skills: string[] | string | null): string[] {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills.filter(Boolean);
  return skills
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export default function RecruitPage() {
  const router = useRouter();
  const params = useParams<{ team_id: string }>();
  const teamId = params?.team_id as string | undefined;

  const [team, setTeam] = useState<Team | null>(null);
  const [candidates, setCandidates] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) {
      // dacă pentru orice motiv nu avem încă teamId, nu rulăm nimic
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setErrorMsg(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Recruit: user error", userError);
        setErrorMsg("Trebuie să fii logat pentru a accesa această pagină.");
        setLoading(false);
        return;
      }

      // 1) verificăm că user-ul este creatorul echipei
      const { data: teamData, error: teamErr } = await supabase
        .from("teams")
        .select("id, name, creator_id")
        .eq("id", teamId)
        .maybeSingle();

      console.log("Recruit: team query result =", { teamData, teamErr });

      if (teamErr && (teamErr as any).code !== "PGRST116") {
        console.error("Recruit: teamErr", teamErr);
        setErrorMsg(
          teamErr.message || "Nu am putut încărca detaliile echipei."
        );
        setLoading(false);
        return;
      }

      if (!teamData) {
        setErrorMsg("Echipa nu există sau nu ai acces la ea.");
        setLoading(false);
        return;
      }

      if (teamData.creator_id !== user.id) {
        setErrorMsg(
          "Doar creatorul echipei poate căuta membri pentru această echipă."
        );
        setLoading(false);
        return;
      }

      setTeam(teamData as Team);

      // 2) luăm toți memberii existenți (profil_id) cu rol = 'member'
      const { data: membersData, error: membersErr } = await supabase
        .from("team_members")
        .select("profile_id, role");

      if (membersErr) {
        console.error("Recruit: membersErr", membersErr);
        setErrorMsg(
          membersErr.message ||
            "Nu am putut încărca informațiile despre membri."
        );
        setLoading(false);
        return;
      }

      const memberIds = new Set(
        (membersData ?? [])
          .filter((m) => m.role === "member")
          .map((m) => m.profile_id as string)
      );

      // 3) luăm toate profilurile și filtrăm pe client
      const { data: profilesData, error: profilesErr } = await supabase
        .from("profiles")
        .select("id, full_name, role, skills, looking_status, links");

      if (profilesErr) {
        console.error("Recruit: profilesErr", profilesErr);
        setErrorMsg(
          profilesErr.message ||
            "Nu am putut încărca lista de participanți."
        );
        setLoading(false);
        return;
      }

      const available = (profilesData ?? []).filter((p) => {
        const role = (p.role || "").toLowerCase();
        return role === "participant" && !memberIds.has(p.id);
      }) as Profile[];

      setCandidates(available);
      setLoading(false);
    };

    loadData();
  }, [teamId]);

  // filtrare după search (nume + skilluri + status)
  const filtered = useMemo(() => {
    if (!search.trim()) return candidates;

    const q = search.toLowerCase();

    return candidates.filter((p) => {
      const name = (p.full_name || "").toLowerCase();
      const skillsArray = normalizeSkills(p.skills);
      const skillsText = skillsArray.join(" ").toLowerCase();
      const status = (p.looking_status || "").toLowerCase();

      return (
        name.includes(q) ||
        skillsText.includes(q) ||
        status.includes(q)
      );
    });
  }, [candidates, search]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* HERO */}
      <section className="relative border-b border-slate-800/60">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-purple-500/20 via-slate-950 to-slate-950" />
        <div className="relative mx-auto max-w-5xl px-4 py-10 space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-purple-200/80">
            TEAM RECRUITING
          </p>
          <h1 className="text-2xl md:text-3xl font-bold">
            Caută membri pentru echipa ta
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Vezi participanții care nu sunt încă într-o echipă și filtrează-i 
            după skill-uri sau status. Poți folosi GitHub / LinkedIn pentru a-i 
            contacta.
          </p>
          {team && (
            <p className="text-xs text-slate-400">
              Echipa ta:{" "}
              <span className="font-semibold text-slate-100">
                {team.name}
              </span>
            </p>
          )}
        </div>
      </section>

      {/* CONTENT */}
      <section className="relative mx-auto max-w-5xl px-4 py-8 space-y-4">
        {loading && (
          <p className="text-sm text-slate-300">Se încarcă participanții...</p>
        )}

        {!loading && errorMsg && (
          <p className="text-sm text-red-400 border border-red-500/40 bg-red-900/30 rounded-lg px-3 py-2">
            {errorMsg}
          </p>
        )}

        {!loading && !errorMsg && (
          <>
            {/* Search */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Participanți disponibili</p>
                <p className="text-xs text-slate-400">
                  {candidates.length === 0
                    ? "Momentan nu sunt participanți disponibili fără echipă."
                    : `Ai ${candidates.length} participanți disponibili. Poți filtra după nume, skill-uri sau status.`}
                </p>
              </div>

              <div className="w-full md:w-72">
                <input
                  placeholder="Caută după nume sau skill (ex: React, AI)..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Lista */}
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {filtered.map((p) => {
                const skillsArr = normalizeSkills(p.skills);

                return (
                  <article
                    key={p.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm shadow-slate-950/60 flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h2 className="text-sm font-semibold">
                          {p.full_name || "Participant anonim"}
                        </h2>
                        {p.looking_status && (
                          <p className="text-xs text-emerald-300">
                            {p.looking_status}
                          </p>
                        )}
                      </div>
                      <span className="inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-200">
                        disponibil
                      </span>
                    </div>

                    {skillsArr.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {skillsArr.map((s) => (
                          <span
                            key={s}
                            className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-100 border border-slate-700"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-1 flex flex-wrap gap-2 text-xs">
                      {p.links?.github && (
                        <a
                          href={p.links.github}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border border-slate-700 px-2 py-1 hover:border-slate-400"
                        >
                          <span></span>
                          <span>GitHub</span>
                        </a>
                      )}
                      {p.links?.linkedin && (
                        <a
                          href={p.links.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border border-slate-700 px-2 py-1 hover:border-sky-400 hover:text-sky-200"
                        >
                          <span>🔗</span>
                          <span>LinkedIn</span>
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}

              {!loading &&
                !errorMsg &&
                candidates.length > 0 &&
                filtered.length === 0 && (
                  <p className="text-sm text-slate-400 col-span-full">
                    Niciun participant nu corespunde filtrului curent. Încearcă
                    alte cuvinte cheie (ex: &quot;React&quot;, &quot;backend&quot;,
                    &quot;design&quot;...).
                  </p>
                )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
