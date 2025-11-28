'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setSuccessMsg('Cont creat! Verifică-ți email-ul pentru confirmare.');
    // dacă vrei să-l trimiți direct la login:
    // router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
      <div className="w-full max-w-md border border-slate-800 rounded-xl p-6 shadow">
        <h1 className="text-2xl font-bold mb-2">Înregistrare</h1>
        <p className="text-sm text-slate-400 mb-6">
          Creează-ți un cont pentru Craiova Hackathon Hub.
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@exemplu.com"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Parola</label>
            <input
              type="password"
              required
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="minim 6 caractere"
            />
          </div>

          {errorMsg && (
            <p className="text-sm text-red-400">
              {errorMsg}
            </p>
          )}

          {successMsg && (
            <p className="text-sm text-emerald-400">
              {successMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 hover:bg-indigo-500 transition px-3 py-2 text-sm font-medium disabled:opacity-60"
          >
            {loading ? 'Se creează contul...' : 'Creează cont'}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-400">
          Ai deja cont?{' '}
          <Link href="/login" className="text-indigo-400 hover:underline">
            Mergi la login
          </Link>
        </p>
      </div>
    </div>
  );
}