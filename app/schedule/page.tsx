"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Event = {
  id: number; // int8
  title: string;
  type: string | null;
  start_time: string;
  end_time: string | null;
  location: string | null;
  description: string | null;
};

// mapăm type -> icon + label
const typeMeta: Record<
  string,
  { label: string; color: string }
> = {
  ceremony: {
    label: "ceremony",
    color: "bg-cyan-500/10 text-cyan-200 border-cyan-400/40",
  },
  presentation: {
    label: "presentation",
    color: "bg-orange-500/10 text-orange-200 border-orange-400/40",
  },
  networking: {
    label: "networking",
    color: "bg-purple-500/10 text-purple-200 border-purple-400/40",
  },
  hacking: {
    label: "hacking",
    color: "bg-slate-500/20 text-slate-100 border-slate-400/40",
  },
};

function getIconForType(type: string | null): string {
  if (!type) return "🎯";
  const t = type.toLowerCase();
  if (t.includes("ceremony")) return "🎤";
  if (t.includes("present")) return "📽️";
  if (t.includes("network")) return "🤝";
  if (t.includes("hack") || t.includes("work")) return "💻";
  if (t.includes("mentorat") || t.includes("mentor")) return "🧠";
  return "🎯";
}

function formatDayName(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ro-RO", {
    weekday: "long",
  });
}

function formatDateHuman(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTimeRange(ev: Event) {
  const start = new Date(ev.start_time);
  const end = ev.end_time ? new Date(ev.end_time) : null;

  const opts: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };

  const s = start.toLocaleTimeString("ro-RO", opts);
  const e = end ? end.toLocaleTimeString("ro-RO", opts) : "";
  return e ? `${s} – ${e}` : s;
}

// grupează evenimentele pe zi (YYYY-MM-DD)
function groupByDay(events: Event[]): Record<string, Event[]> {
  return events.reduce((acc, ev) => {
    const dayKey = ev.start_time.slice(0, 10); // prima parte din ISO
    if (!acc[dayKey]) acc[dayKey] = [];
    acc[dayKey].push(ev);
    return acc;
  }, {} as Record<string, Event[]>);
}

export default function SchedulePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start_time", { ascending: true });

      if (error) {
        console.error("loadEvents error:", error);
        setErrorMsg(error.message);
        setEvents([]);
      } else {
        setEvents((data ?? []) as Event[]);
      }

      setLoading(false);
    };

    loadEvents();
  }, []);

  const grouped = groupByDay(events);
  const sortedDays = Object.keys(grouped).sort(); // YYYY-MM-DD sortează ok

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="relative border-b border-slate-800/60">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-slate-950 to-slate-950" />
        <div className="relative mx-auto max-w-5xl px-4 py-12">
          <h1 className="text-center text-3xl font-bold md:text-4xl">
            Programul hackathonului
          </h1>
          <p className="mt-3 text-center text-sm text-slate-300 max-w-xl mx-auto">
            Vezi toate sesiunile, de la înregistrare și keynote-uri, până la
            orele de hacking și networking.
          </p>
        </div>
      </section>

      <section className="relative mx-auto max-w-5xl px-4 py-8">
        {loading && <p>Se încarcă evenimentele...</p>}

        {!loading && errorMsg && (
          <p className="text-red-400 text-sm">
            Eroare la încărcarea evenimentelor: {errorMsg}
          </p>
        )}

        {!loading && !errorMsg && events.length === 0 && (
          <p className="text-slate-400 text-sm">
            Nu există încă evenimente în calendar.
          </p>
        )}

        {!loading && !errorMsg && events.length > 0 && (
          <div className="space-y-10">
            {sortedDays.map((dayKey) => {
              const dayEvents = grouped[dayKey].slice().sort((a, b) =>
                a.start_time.localeCompare(b.start_time)
              );
              const anyDate = dayEvents[0].start_time;

              return (
                <div key={dayKey} className="space-y-4">
                  <div className="text-center">
                    <h2 className="text-2xl font-semibold capitalize">
                      {formatDayName(anyDate)}
                    </h2>
                    <p className="text-sm text-slate-300">
                      {formatDateHuman(anyDate)}
                    </p>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {dayEvents.map((ev) => {
                      const t = (ev.type || "").toLowerCase();
                      const meta =
                        t && typeMeta[t]
                          ? typeMeta[t]
                          : {
                              label: ev.type,
                              color:
                                "bg-slate-700/40 text-slate-100 border-slate-500/50",
                            };

                      const icon = getIconForType(ev.type);

                      return (
                        <article
                          key={ev.id}
                          className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 shadow-sm shadow-slate-900/60"
                        >
                          <div className="flex gap-3">
                            <div className="mt-1 text-2xl">{icon}</div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <button className="text-xs font-medium text-fuchsia-300 flex items-center gap-1">
                                  <span className="text-[13px]">⏱️</span>
                                  {formatTimeRange(ev)}
                                </button>
                                {ev.type && (
                                  <span
                                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${meta.color}`}
                                  >
                                    {meta.label}
                                  </span>
                                )}
                              </div>

                              <h3 className="text-sm font-semibold">
                                {ev.title}
                              </h3>

                              {ev.location && (
                                <p className="text-xs text-slate-300">
                                  📍 {ev.location}
                                </p>
                              )}

                              {ev.description && (
                                <p className="text-xs text-slate-300 mt-1">
                                  {ev.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
