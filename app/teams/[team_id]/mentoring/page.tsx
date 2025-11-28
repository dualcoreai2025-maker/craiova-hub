"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Slot = {
  id: string;
  start_time: string;
  end_time: string;
};

export default function TeamMentoringPage() {
  const params = useParams() as { team_id?: string };
  const teamId = params.team_id;

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [bookingMsg, setBookingMsg] = useState<string | null>(null);

  // 1. load sloturi libere
  useEffect(() => {
    const loadSlots = async () => {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("mentoring_slots")
        .select("id, start_time, end_time")
        .eq("is_booked", false)
        .gt("start_time", new Date().toISOString())
        .order("start_time", { ascending: true });

      if (error) {
        setErrorMsg(error.message);
        setSlots([]);
      } else {
        setSlots(data as Slot[]);
      }

      setLoading(false);
    };

    loadSlots();
  }, []);

  const handleBook = async (slotId: string) => {
    if (!teamId) {
      setBookingMsg("Lipsă team_id în URL.");
      return;
    }

    setBookingMsg(null);

    // 2. insert în mentoring_bookings
    const { error: insertError } = await supabase
      .from("mentoring_bookings")
      .insert({
        slot_id: slotId,
        team_id: teamId,
        notes: null,
      });

    if (insertError) {
      setBookingMsg("Eroare la booking: " + insertError.message);
      return;
    }

    // 3. update slot -> is_booked = true
    const { error: updateError } = await supabase
      .from("mentoring_slots")
      .update({ is_booked: true })
      .eq("id", slotId);

    if (updateError) {
      setBookingMsg("Booking creat, dar nu am putut marca slotul ca ocupat.");
      return;
    }

    setBookingMsg("Slot rezervat cu succes!");

    // scoatem slotul din listă local
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Mentorat – Alege un slot</h1>

        {loading && <p>Se încarcă sloturile...</p>}
        {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}
        {bookingMsg && (
          <p className="text-emerald-400 text-sm">{bookingMsg}</p>
        )}

        {!loading && !errorMsg && slots.length === 0 && (
          <p className="text-slate-400 text-sm">
            Nu există sloturi libere momentan.
          </p>
        )}

        <div className="space-y-3">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="border border-slate-700 rounded p-3 flex items-center justify-between"
            >
              <div className="text-sm">
                <p>
                  <span className="font-semibold">Start:</span>{" "}
                  {new Date(slot.start_time).toLocaleString()}
                </p>
                <p>
                  <span className="font-semibold">End:</span>{" "}
                  {new Date(slot.end_time).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleBook(slot.id)}
                className="px-3 py-1 rounded bg-indigo-600 text-white text-sm"
              >
                Book
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
