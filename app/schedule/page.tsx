"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Event = {
  id: number;          // la tine id e int8
  title: string;
  type: string | null;
  start_time: string;
  end_time: string | null;
  location: string | null;
  description: string | null;
};

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
        .select("*")                     // FARA FILTRE
        .order("start_time", { ascending: true });

      console.log("loadEvents result:", { data, error });

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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold mb-4">Schedule</h1>

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
          <div className="space-y-3">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="border border-slate-700 rounded-lg p-4 bg-slate-900"
              >
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold">{ev.title}</h2>
                  {ev.type && (
                    <span className="text-xs uppercase text-indigo-300">
                      {ev.type}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 mt-1">
                  {new Date(ev.start_time).toLocaleString()}{" "}
                  {ev.end_time && <>– {new Date(ev.end_time).toLocaleString()}</>}
                </p>

                {ev.location && (
                  <p className="text-xs text-slate-300 mt-1">
                    Locație: {ev.location}
                  </p>
                )}

                {ev.description && (
                  <p className="text-sm text-slate-200 mt-2">
                    {ev.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}