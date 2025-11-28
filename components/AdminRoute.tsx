'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type AdminRouteProps = {
  children: React.ReactNode;
};

type Profile = {
  id: string;
  role: string | null;
};

export default function AdminRoute({ children }: AdminRouteProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login'); // sau '/'
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .single<Profile>();

      if (error) {
        console.error('Error loading profile', error);
        router.push('/');
        return;
      }

      if (profile.role !== 'admin') {
        router.push('/'); // sau o pagină /403
        return;
      }

      setAllowed(true);
      setLoading(false);
    };

    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <p>Verificăm permisiunile...</p>
      </main>
    );
  }

  if (!allowed) {
    // teoretic nu mai ajungem aici pentru că dăm redirect,
    // dar e un fallback bun
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <p>Nu ai acces la această secțiune.</p>
      </main>
    );
  }

  return <>{children}</>;
}
