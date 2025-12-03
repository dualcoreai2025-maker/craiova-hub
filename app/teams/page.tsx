"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Team = {
  id: string;
  name: string;
  track: string | null;
  description: string | null;
  creator_id: string | null;
};

type Member = {
  profile_id: string;
  role: string | null;
  full_name: string | null;
  skills: string[] | string | null;
};

type InviteWithTeam = {
  id: number;
  team_id: string;
  team_name: string | null;
  status: string;
};

function normalizeSkills(skills: string[] | string | null): string[] {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills.filter(Boolean);
  return skills
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export default function TeamsPage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<InviteWithTeam[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadTeamAndMembers = async () => {
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

      setCurrentUserId(user.id);

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

      // 3) invitații PENDING pentru user (doar dacă nu are echipă)
      if (!finalTeam) {
        const { data: invitesData, error: invitesErr } = await supabase
          .from("team_invites")
          .select("id, team_id, status, teams(name)")
          .eq("profile_id", user.id)
          .eq("status", "pending");

        if (invitesErr) {
          console.error(invitesErr);
        } else {
          const mapped =
            invitesData?.map((inv: any) => ({
              id: inv.id,
              team_id: inv.team_id,
              status: inv.status,
              team_name: inv.teams?.name ?? "Echipă",
            })) ?? [];
          setInvites(mapped);
        }
      } else {
        setInvites([]);
      }

      // 4) dacă avem echipă, încarc membrii
      if (finalTeam) {
        const { data: membersData, error: membersErr } = await supabase
          .from("team_members")
          .select("profile_id, role, profiles(full_name, skills)")
          .eq("team_id", finalTeam.id);

        if (membersErr) {
          console.error(membersErr);
          setErrorMsg(
            membersErr.message ||
              "Nu am putut încărca lista membrilor echipei."
          );
          setLoading(false);
          return;
        }

        const mapped: Member[] =
          membersData?.map((m: any) => ({
            profile_id: m.profile_id,
            role: m.role,
            full_name: m.profiles?.full_name ?? null,
            skills: m.profiles?.skills ?? null,
          })) ?? [];

        setMembers(mapped);
      } else {
        setMembers([]);
      }

      setLoading(false);
    };

    loadTeamAndMembers();
  }, []);

  // Acceptă invitația -> intră în echipă
  const handleAcceptInvite = async (inviteId: number, teamId: string) => {
    if (!currentUserId) return;
    setErrorMsg(null);

    const { error: memberErr } = await supabase.from("team_members").insert({
      team_id: teamId,
      profile_id: currentUserId,
      role: "member",
    });

    if (memberErr) {
      console.error(memberErr);
      setErrorMsg(
        memberErr.message || "Nu am putut accepta invitația în echipă."
      );
      return;
    }

    await supabase
      .from("team_invites")
      .update({ status: "accepted" })
      .eq("id", inviteId);

    // reload simplu ca să refacem tot contextul
    window.location.reload();
  };

  // Respinge invitația
  const handleRejectInvite = async (inviteId: number) => {
    setErrorMsg(null);
    const { error } = await supabase
      .from("team_invites")
      .update({ status: "rejected" })
      .eq("id", inviteId);

    if (error) {
      console.error(error);
      setErrorMsg(error.message || "Nu am putut respinge invitația.");
      return;
    }

    setInvites((prev) => prev.filter((inv) => inv.id !== inviteId));
  };

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
            Un participant poate fi doar într-o singură echipă. Aici vezi echipa
            ta, invitațiile primite și membrii.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="relative mx-auto max-w-4xl px-4 py-8 space-y-6">
        {loading && (
          <p className="text-sm text-slate-300">Se încarcă informațiile...</p>
        )}

        {!loading && errorMsg && (
          <p className="text-sm text-red-400">{errorMsg}</p>
        )}

        {/* Invitații primite (dacă nu ai echipă încă) */}
        {!loading && !errorMsg && !team && invites.length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
            <h3 className="text-sm font-semibold">Invitații primite</h3>
            <p className="text-xs text-slate-400">
              Ai fost invitat în {invites.length} echipă/echipe. Poți accepta
              doar una (poți fi membru într-o singură echipă).
            </p>
            <div className="flex flex-col gap-2">
              {invites.map((inv) => (
                <div
                  key={inv.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      Ești invitat în echipa{" "}
                      <span className="text-emerald-300">
                        {inv.team_name || "Echipă"}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={() => handleAcceptInvite(inv.id, inv.team_id)}
                      className="rounded-lg bg-emerald-500 px-3 py-1.5 font-semibold text-slate-950 hover:bg-emerald-400"
                    >
                      Acceptă
                    </button>
                    <button
                      onClick={() => handleRejectInvite(inv.id)}
                      className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-200 hover:border-red-500 hover:text-red-300"
                    >
                      Respinge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dacă nu ai echipă și nici invitații */}
        {!loading && !errorMsg && !team && invites.length === 0 && (
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

        {/* Card echipă + membri */}
        {!loading && !errorMsg && team && (
          <>
            {/* Card echipă - neschimbat față de ce aveam */}
            <div className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm shadow-slate-900/50">
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
                    <>
                      <Link
                        href={`/teams/${team.id}/recruit`}
                        className="inline-flex items-center gap-1 rounded-lg border border-purple-400/70 bg-purple-500/15 px-3 py-1.5 font-semibold text-purple-100 hover:bg-purple-500/25"
                      >
                        🔍 Caută membri
                      </Link>

                      <Link
                        href={`/teams/${team.id}/project`}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 font-semibold text-slate-950 hover:bg-emerald-400"
                      >
                        ✏️ Editează proiectul
                      </Link>
                    </>
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

            {/* Lista de membri */}
            <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Membrii echipei</h3>
                <span className="text-xs text-slate-400">
                  {members.length} membru{members.length === 1 ? "" : "i"}
                </span>
              </div>

              {members.length === 0 && (
                <p className="text-sm text-slate-400">
                  Momentan nu există membri în echipă. Dacă ești creatorul, poți
                  trimite invitații din pagina „Caută membri”.
                </p>
              )}

              {members.length > 0 && (
                <div className="flex flex-col gap-2">
                  {members.map((m) => {
                    const skillsArr = normalizeSkills(m.skills);

                    return (
                      <div
                        key={m.profile_id}
                        className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {m.full_name || "Participant anonim"}
                          </p>
                          {skillsArr.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {skillsArr.slice(0, 4).map((s) => (
                                <span
                                  key={s}
                                  className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-100 border border-slate-700"
                                >
                                  {s}
                                </span>
                              ))}
                              {skillsArr.length > 4 && (
                                <span className="text-[11px] text-slate-400">
                                  +{skillsArr.length - 4} skill-uri
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-200">
                          {m.role || "member"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
