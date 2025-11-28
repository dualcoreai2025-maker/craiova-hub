"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminRoute from "@/components/AdminRoute";  // <- IMPORTANT

type EventRow = {
  id: number;
  title: string;
  type: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  description: string | null;
};

const toInputDateTime = (iso: string | null) => {
  if (!iso) return "";
  return iso.slice(0, 16);
};

/* ---------------------------------------------------
   LOGICA PAGINII — se încarcă DOAR dacă AdminRoute permite
---------------------------------------------------- */
function AdminEventsInnerPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    type: "",
    start_time: "",
    end_time: "",
    location: "",
    description: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    setErrorMsg(null);

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("start_time", { ascending: true });

    if (error) {
      setErrorMsg(error.message);
      console.error(error);
      setEvents([]);
    } else {
      setEvents((data || []) as EventRow[]);
    }

    setLoading(false);
  };

  // ───────────────────────────────────────────────
  // SAVE (create + update)
  // ───────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg(null);

    const payload = {
      title: form.title.trim(),
      type: form.type.trim() || null,
      location: form.location.trim() || null,
      description: form.description.trim() || null,
      start_time: form.start_time
        ? new Date(form.start_time).toISOString()
        : null,
      end_time: form.end_time ? new Date(form.end_time).toISOString() : null,
    };

    if (!payload.title) {
      setErrorMsg("Titlul este obligatoriu.");
      setLoading(false);
      return;
    }

    let dbError = null;

    if (editingId === null) {
      const { error } = await supabase.from("events").insert(payload);
      dbError = error;
    } else {
      const { error } = await supabase
        .from("events")
        .update(payload)
        .eq("id", editingId);
      dbError = error;
    }

    if (dbError) {
      setErrorMsg(dbError.message);
      console.error(dbError);
    } else {
      setForm({
        title: "",
        type: "",
        start_time: "",
        end_time: "",
        location: "",
        description: "",
      });
      setEditingId(null);
      await loadEvents();
    }

    setLoading(false);
  };

  // EDIT
  const handleEdit = (ev: EventRow) => {
    setEditingId(ev.id);
    setForm({
      title: ev.title ?? "",
      type: ev.type ?? "",
      start_time: toInputDateTime(ev.start_time),
      end_time: toInputDateTime(ev.end_time),
      location: ev.location ?? "",
      description: ev.description ?? "",
    });
  };

  // DELETE
  const handleDelete = async (id: number) => {
    if (!confirm("Sigur vrei să ștergi acest eveniment?")) return;

    setLoading(true);
    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) {
      setErrorMsg(error.message);
      console.error(error);
    } else {
      await loadEvents();
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Admin – Evenimente</h1>
        <p className="text-sm text-slate-400">
          Aici poți adăuga, edita și șterge evenimentele din calendar.
        </p>

        {errorMsg && (
          <p className="text-sm text-red-400 border border-red-500/40 rounded-md px-3 py-2 bg-red-950/40">
            {errorMsg}
          </p>
        )}

        {/* FORMULAR CREATE / UPDATE */}
        <section className="border border-slate-700 rounded-xl p-4 bg-slate-900/60 space-y-4">
          <h2 className="font-semibold text-lg">
            {editingId ? "Editează eveniment" : "Adaugă eveniment"}
          </h2>

          <div className="space-y-3">
            <input
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
              placeholder="Titlu"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <input
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
              placeholder="Tip (workshop, keynote...)"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400">Start time</label>
                <input
                  type="datetime-local"
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                  value={form.start_time}
                  onChange={(e) =>
                    setForm({ ...form, start_time: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs text-slate-400">End time</label>
                <input
                  type="datetime-local"
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                  value={form.end_time}
                  onChange={(e) =>
                    setForm({ ...form, end_time: e.target.value })
                  }
                />
              </div>
            </div>

            <input
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
              placeholder="Locație"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />

            <textarea
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm min-h-[80px]"
              placeholder="Descriere"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-sm font-medium disabled:opacity-60"
            >
              {editingId ? "Salvează modificările" : "Adaugă eveniment"}
            </button>
          </div>
        </section>

        {/* LISTA EVENIMENTELOR */}
        <section className="space-y-3">
          <h2 className="font-semibold text-lg">Lista de evenimente</h2>

          {events.length === 0 && (
            <p className="text-sm text-slate-400">Nu există evenimente.</p>
          )}

          {events.map((ev) => (
            <div
              key={ev.id}
              className="border border-slate-700 rounded-lg px-4 py-3 bg-slate-900/60 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
            >
              <div>
                <div className="font-medium text-sm">{ev.title}</div>
                <div className="text-xs text-slate-400">
                  {ev.type && <span>Tip: {ev.type} · </span>}
                  {ev.start_time && (
                    <span>
                      Start: {new Date(ev.start_time).toLocaleString("ro-RO")} ·{" "}
                    </span>
                  )}
                  {ev.end_time && (
                    <span>
                      End: {new Date(ev.end_time).toLocaleString("ro-RO")}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => handleEdit(ev)}
                  className="px-3 py-1 rounded-md border border-slate-600 text-slate-100 hover:bg-slate-700"
                >
                  Editează
                </button>
                <button
                  onClick={() => handleDelete(ev.id)}
                  className="px-3 py-1 rounded-md border border-red-600 text-red-300 hover:bg-red-900/60"
                >
                  Șterge
                </button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

/* ---------------------------------------------------
   EXPORT FINAL CU AdminRoute
---------------------------------------------------- */
export default function AdminEventsPage() {
  return (
    <AdminRoute>
      <AdminEventsInnerPage />
    </AdminRoute>
  );
}
