"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Resource = {
  id: string;
  title: string;
  type: string | null;
  category: string | null;
  url: string;
  created_at: string;
};

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadResources = async () => {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("created_at", { ascending: false });

      console.log("loadResources:", { data, error });

      if (error) {
        setErrorMsg(error.message);
        setResources([]);
      } else {
        setResources((data ?? []) as Resource[]);
      }

      setLoading(false);
    };

    loadResources();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold mb-4">Resurse</h1>

        {loading && <p>Se încarcă resursele...</p>}

        {!loading && errorMsg && (
          <p className="text-red-400 text-sm">
            Eroare la încărcarea resurselor: {errorMsg}
          </p>
        )}

        {!loading && !errorMsg && resources.length === 0 && (
          <p className="text-slate-400 text-sm">
            Nu există încă resurse adăugate.
          </p>
        )}

        {!loading && !errorMsg && resources.length > 0 && (
          <div className="space-y-3">
            {resources.map((r) => (
              <div
                key={r.id}
                className="border border-slate-700 rounded-lg p-4 bg-slate-900"
              >
                <div className="flex justify-between items-center gap-4">
                  <div>
                    <h2 className="font-semibold">{r.title}</h2>
                    {r.category && (
                      <p className="text-xs text-indigo-300 mt-1">
                        Categoria: {r.category}
                      </p>
                    )}
                    {r.type && (
                      <p className="text-xs text-slate-400">
                        Tip: {r.type}
                      </p>
                    )}
                  </div>

                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-sky-400 underline"
                  >
                    Deschide
                  </a>
                </div>

                <p className="text-[10px] text-slate-500 mt-2">
                  Adăugat la:{" "}
                  {new Date(r.created_at).toLocaleString("ro-RO")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
