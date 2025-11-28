'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';


type Team = {
  id: string;
  name: string;
  description: string | null;
  track: string | null;
  invite_code: string | null;
};

export default function TeamPage() {
  const params = useParams() as { team_id?: string };
  const teamId = params.team_id;

  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) return;

    const loadTeam = async () => {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      console.log('loadTeam result:', { data, error });

      if (error) {
        setErrorMsg(error.message);
        setTeam(null);
      } else {
        setTeam(data as Team);
      }

      setLoading(false);
    };

    loadTeam();
  }, [teamId]);

  if (!teamId) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <p>Nu am primit team_id din URL.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        {loading && <p>Se încarcă echipa...</p>}

        {!loading && errorMsg && (
          <p className="text-red-400 text-sm">
            Eroare la încărcarea echipei: {errorMsg}
          </p>
        )}

        {!loading && !errorMsg && !team && (
          <p className="text-slate-400 text-sm">
            Nu am găsit nicio echipă cu acest ID.
          </p>
        )}

        {!loading && team && (
  <>
    <h1 className="text-2xl font-bold">{team.name}</h1>

    {team.track && (
      <p className="text-xs uppercase text-indigo-300">
        Track: {team.track}
      </p>
    )}

    {team.description && (
      <p className="text-sm text-slate-300 mt-2">
        {team.description}
      </p>
    )}

    {team.invite_code && (
      <p className="text-xs text-slate-500 mt-4">
        Cod invitație:{' '}
        <span className="font-mono">{team.invite_code}</span>
      </p>
    )}

    {/* 🔗 LINK CĂTRE PROIECTUL ECHIPEI */}
    <div className="mt-6">
      <Link
        href={`/teams/${teamId}/project`}
        className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm"
      >
        Vezi / editează proiectul echipei
      </Link>
    </div>
  </>
)}

      </div>
    </main>
  );
}
