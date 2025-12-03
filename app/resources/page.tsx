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
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* BG glow */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.16),_transparent_55%)]" />

      {/* HERO */}
      <section className="relative border-b border-slate-800/60">
        <div className="relative mx-auto max-w-5xl px-4 py-10 space-y-4 md:py-14">
          <p className="text-xs uppercase tracking-[0.25em] text-indigo-300/80">
            knowledge base
          </p>
          <h1 className="text-3xl md:text-4xl font-bold">
            Resurse pentru{" "}
            <span className="text-indigo-400">hackathon & învățare</span>
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Ghiduri, articole, repo-uri și alte materiale care te ajută să
            construiești mai repede: de la AI și web, la design, pitching și
            bune practici.
          </p>

          <div className="flex flex-wrap gap-3 text-xs text-slate-300 mt-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Link-uri verificate de organizatori
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              Documentație, tutoriale & tool-uri
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="relative mx-auto max-w-5xl px-4 py-8 md:py-10">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <span className="h-3 w-3 rounded-full border-2 border-slate-500 border-t-transparent animate-spin" />
            <span>Se încarcă resursele...</span>
          </div>
        )}

        {!loading && errorMsg && (
          <p className="text-sm text-red-400 border border-red-500/40 bg-red-900/20 rounded-md px-3 py-2">
            Eroare la încărcarea resurselor: {errorMsg}
          </p>
        )}

        {!loading && !errorMsg && resources.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/70 px-5 py-6 text-sm text-slate-300">
            Nu există încă resurse adăugate. Revino mai târziu – vom popula
            secțiunea cu ghiduri și link-uri utile pe măsură ce se apropie
            hackathon-ul.
          </div>
        )}

        {!loading && !errorMsg && resources.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                {resources.length} resurs
                {resources.length === 1 ? "ă" : "e"} disponibile
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {resources.map((r) => {
                const created = new Date(r.created_at);
                const formattedDate = created.toLocaleString("ro-RO", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <article
                    key={r.id}
                    className="group flex h-full flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm shadow-slate-950/60 transition hover:border-indigo-400/70 hover:bg-slate-900"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="text-sm font-semibold text-slate-50">
                          {r.title}
                        </h2>
                      </div>

                      <div className="flex flex-wrap gap-2 text-[11px]">
                        {r.category && (
                          <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-100 border border-slate-700">
                            {r.category}
                          </span>
                        )}
                        {r.type && (
                          <span className="inline-flex items-center rounded-full bg-slate-900 px-2 py-0.5 text-[11px] text-indigo-200 border border-indigo-500/40">
                            {r.type}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500">
                        Adăugată la {formattedDate}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-sm shadow-sky-500/40 transition group-hover:bg-sky-400"
                      >
                        <span>🔗</span>
                        <span>Deschide resursa</span>
                      </a>
                      <span className="text-[10px] text-slate-500">
                        Link extern
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
