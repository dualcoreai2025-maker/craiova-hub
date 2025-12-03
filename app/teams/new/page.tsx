"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function NewTeamPage() {
  const router = useRouter();

  const [teamName, setTeamName] = useState("");
  const [track, setTrack] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [alreadyInTeam, setAlreadyInTeam] = useState(false);

  useEffect(() => {
    const checkTeam = async () => {
      setLoading(true);
      setErrorMsg(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorMsg("Trebuie să fii logat pentru a crea o echipă.");
        setLoading(false);
        return;
      }

      // 1) vezi dacă userul a creat deja o echipă
      const { data: createdTeam, error: createdErr } = await supabase
        .from("teams")
        .select("id")
        .eq("creator_id", user.id)
        .maybeSingle();

      if (createdErr && (createdErr as any).code !== "PGRST116") {
        console.error(createdErr);
      }

      // 2) vezi dacă userul e membru într-o echipă
      const { data: memberRow, error: memberErr } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("profile_id", user.id)
        .eq("role", "member")
        .maybeSingle();

      if (memberErr && (memberErr as any).code !== "PGRST116") {
        console.error(memberErr);
      }

      if (createdTeam || memberRow) {
        setAlreadyInTeam(true);
      }

      setLoading(false);
    };

    checkTeam();
  }, []);

  const handleCreate = async () => {
    setLoading(true);
    setErrorMsg(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMsg("Trebuie să fii logat.");
      setLoading(false);
      return;
    }

    if (!teamName.trim()) {
      setErrorMsg("Numele echipei este obligatoriu.");
      setLoading(false);
      return;
    }

    // verificare defensivă
    const { data: existingMember } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("profile_id", user.id)
      .eq("role", "member")
      .maybeSingle();

    if (existingMember) {
      setErrorMsg("Ești deja într-o echipă și nu poți crea alta.");
      setLoading(false);
      return;
    }

    // 1) creăm echipa cu creator_id
    const { data: newTeam, error } = await supabase
      .from("teams")
      .insert({
        name: teamName.trim(),
        track: track.trim() || null,
        description: description.trim() || null,
        creator_id: user.id,
      })
      .select("id")
      .single();

    if (error) {
      console.error(error);
      setErrorMsg("Nu am putut crea echipa. Verifică dacă nu ai deja una.");
      setLoading(false);
      return;
    }

    // 2) îl adăugăm pe creator în team_members
    const { error: memberError } = await supabase.from("team_members").insert({
      team_id: newTeam.id,
      profile_id: user.id,
      role: "member",
    });

    if (memberError) {
      console.error(memberError);
      // nu blocăm redirect-ul, dar e bine să vezi eroarea în console
    }

    router.push("/teams");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* HERO */}
      <section className="relative border-b border-slate-800/60">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-purple-500/20 via-slate-950 to-slate-950" />
        <div className="relative mx-auto max-w-5xl px-4 py-12">
          <h1 className="text-center text-3xl font-bold md:text-4xl">
            Creează o echipă
          </h1>
          <p className="mt-3 text-center text-sm text-slate-300 max-w-xl mx-auto">
            Alege un nume reprezentativ, track-ul la care vrei să participi și
            descrie pe scurt ideea sau direcția echipei tale.
          </p>
        </div>
      </section>

      {/* FORM */}
      <section className="relative mx-auto max-w-xl px-4 py-8">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm shadow-slate-900/60 space-y-4">
          {alreadyInTeam && (
            <p className="text-sm text-amber-300 border border-amber-400/40 bg-amber-500/10 rounded-lg px-3 py-2">
              Ești deja într-o echipă sau ai creat una. Poți vedea echipa ta în{" "}
              <Link
                href="/teams"
                className="underline underline-offset-2 font-semibold"
              >
                pagina „Echipa mea”.
              </Link>
            </p>
          )}

          {errorMsg && (
            <p className="text-sm text-red-400 border border-red-500/40 bg-red-900/30 rounded-lg px-3 py-2">
              {errorMsg}
            </p>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Nume echipă</label>
            <input
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
              placeholder="ex: Craiova Coders"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              disabled={loading || alreadyInTeam}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Track / temă</label>
            <input
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
              placeholder="ex: AI, Educație, Sustenabilitate..."
              value={track}
              onChange={(e) => setTrack(e.target.value)}
              disabled={loading || alreadyInTeam}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descriere</label>
            <textarea
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm min-h-[90px]"
              placeholder="Scrie câteva propoziții despre ideea echipei tale sau problema pe care vrei să o rezolvi."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading || alreadyInTeam}
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={loading || alreadyInTeam}
            className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-2.5 text-sm font-semibold shadow-md shadow-emerald-500/40 disabled:opacity-60"
          >
            {loading ? "Se creează echipa..." : "Creează echipa"}
          </button>

          {!alreadyInTeam && (
            <p className="text-[11px] text-slate-400">
              Notă: poți crea o singură echipă și poți fi membru doar într-o
              echipă pe durata hackathonului.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
