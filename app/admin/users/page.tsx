'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminRoute from '@/components/AdminRoute';

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
};

function AdminUsersInner() {
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select("id, full_name, role")
        .order('full_name', { ascending: true });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setUsers(data as ProfileRow[]);
      }
      setLoading(false);
    };

    loadUsers();
  }, []);

  const handleRoleChange = async (id: string, newRole: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', id);

    if (error) {
      alert('Nu am putut actualiza rolul: ' + error.message);
      return;
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: newRole } : u)),
    );
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Admin – Useri</h1>

        {loading && <p>Se încarcă...</p>}
        {errorMsg && <p className="text-red-400">{errorMsg}</p>}

        <table className="w-full text-sm border border-slate-700">
          <thead className="bg-slate-900">
            <tr>
              <th className="p-2 text-left">Nume</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Rol</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-800">
                <td className="p-2">{u.full_name || '(fără nume)'}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">
                  <select
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1"
                    value={u.role || 'participant'}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  >
                    <option value="participant">participant</option>
                    <option value="mentor">mentor</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default function AdminUsersPage() {
  return (
    <AdminRoute>
      <AdminUsersInner />
    </AdminRoute>
  );
}
