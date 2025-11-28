'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Project = {
  id: string;
  team_id: string;
  title: string | null;
  short_description: string | null;
  description: string | null;
  repo_url: string | null;
  demo_url: string | null;
};

export default function TeamProjectPage() {
  const params = useParams() as { team_id?: string };
  const router = useRouter();
  const teamId = params.team_id;

  const [project, setProject] = useState<Project | null>(null);
  const [title, setTitle] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // încarcă proiectul existent (dacă există)
  useEffect(() => {
    if (!teamId) return;

    const loadProject = async () => {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
  .from('projects')              // ATENȚIE: dacă tabelul tău se numește `project_submissions`,
  .select('*')                   // schimbă aici în `from('project_submissions')`
  .eq('team_id', teamId)
  .maybeSingle();                // 👈 important: nu dă eroare dacă nu există rând


      if (error) {
  console.error('loadProject error:', error);
  setErrorMsg(error.message);
} else if (data) {
  // există deja un proiect pentru echipă -> populăm formularul
  setProject(data as Project);
  setTitle(data.title ?? '');
  setShortDesc(data.short_description ?? '');
  setDescription(data.description ?? '');
  setRepoUrl(data.repo_url ?? '');
  setDemoUrl(data.demo_url ?? '');
} else {
  // nu există niciun proiect încă -> formularul rămâne gol
  console.log('Nu există încă proiect pentru această echipă – e ok.');
}


      setLoading(false);
    };

    loadProject();
  }, [teamId]);

  const handleSave = async () => {
    if (!teamId) return;
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // verificăm dacă userul e logat (poți adăuga și verificare de rol/team_members)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorMsg('Trebuie să fii logat ca să salvezi proiectul.');
      setSaving(false);
      return;
    }

    const payload = {
      team_id: teamId,
      title,
      short_description: shortDesc,
      description,
      repo_url: repoUrl,
      demo_url: demoUrl,
      // submitted_at: putem seta mai târziu când apeși "Trimite oficial"
    };

    // dacă există proiect, facem update; dacă nu, insert (upsert)
    const { data, error } = await supabase
      .from('projects')
      .upsert(payload, { onConflict: 'team_id' }) // un proiect per echipă
      .select()
      .single();

    if (error) {
      console.error('save project error:', error);
      setErrorMsg(error.message);
    } else {
      setProject(data as Project);
      setSuccessMsg('Proiect salvat cu succes ✅');
    }

    setSaving(false);
  };

  if (!teamId) {
    return <p className="p-6 text-red-400">Lipsește team_id din URL.</p>;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Proiectul echipei</h1>

        {loading && <p>Se încarcă datele proiectului...</p>}

        {!loading && (
          <>
            <input
              className="border border-slate-700 bg-slate-900 p-2 w-full rounded"
              placeholder="Titlul proiectului"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              className="border border-slate-700 bg-slate-900 p-2 w-full rounded"
              placeholder="Descriere scurtă (pitch)"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
            />

            <textarea
              className="border border-slate-700 bg-slate-900 p-2 w-full rounded h-32"
              placeholder="Descriere detaliată (feature-uri, tech stack, ce ați construit)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <input
              className="border border-slate-700 bg-slate-900 p-2 w-full rounded"
              placeholder="Repo URL (GitHub etc.)"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
            />

            <input
              className="border border-slate-700 bg-slate-900 p-2 w-full rounded"
              placeholder="Demo URL (link video / live app)"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
            />

            {errorMsg && (
              <p className="text-red-400 text-sm">{errorMsg}</p>
            )}
            {successMsg && (
              <p className="text-emerald-400 text-sm">{successMsg}</p>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded"
            >
              {saving ? 'Se salvează...' : 'Salvează proiectul'}
            </button>
          </>
        )}
      </div>
    </main>
  );
}