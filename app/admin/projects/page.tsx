'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminRoute from '@/components/AdminRoute';

type ProjectRow = {
  id: string;
  team_id: string | null;
  title: string;
  repo_url: string | null;
};

function AdminProjectsInner() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);

  useEffect(() => {
    const loadProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, team_id, title, repo_url')
        .order('title', { ascending: true });

      if (error) {
        console.error(error);
      } else {
        setProjects(data as ProjectRow[]);
      }
    };

    loadProjects();
  }, []);

  const handleExportCsv = () => {
    window.location.href = '/api/projects/export';
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin – Proiecte</h1>
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 bg-emerald-600 rounded text-sm font-medium"
          >
            Export CSV
          </button>
        </div>

        <table className="w-full text-sm border border-slate-700">
          <thead className="bg-slate-900">
            <tr>
              <th className="p-2 text-left">Echipă</th>
              <th className="p-2 text-left">Titlu</th>
              <th className="p-2 text-left">Repo</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-t border-slate-800">
                <td className="p-2">{p.team_id}</td>
                <td className="p-2">{p.title}</td>
                <td className="p-2">
                  {p.repo_url ? (
                    <a
                      href={p.repo_url}
                      target="_blank"
                      className="text-sky-400 underline"
                    >
                      link
                    </a>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default function AdminProjectsPage() {
  return (
    <AdminRoute>
      <AdminProjectsInner />
    </AdminRoute>
  );
}
