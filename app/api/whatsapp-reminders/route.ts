// app/api/whatsapp-reminders/route.ts
import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

// câte minute avem "fereastra" în care acceptăm trimiterea reminder-ului
const REMINDER_WINDOW_MINUTES = 5;

type Profile = {
  full_name: string | null;
  phone_number: string | null;
  whatsapp_opt_in: boolean | null;
};

type EventWithProfile = {
  id: string;
  title: string;                // schimbă dacă la tine coloana se numește altfel
  start_time: string;           // la fel, pune numele real din tabel
  reminder_minutes_before: number;
  reminder_sent_whatsapp: boolean;
  profiles: Profile[];          // IMPORTANT: e un array de Profile
};

export async function GET() {
  const now = new Date();
  const nowIso = now.toISOString();
  const twoHoursLaterIso = new Date(
    now.getTime() + 2 * 60 * 60 * 1000
  ).toISOString();

  // 1. Luăm evenimentele care încep în următoarele 2 ore și n-au reminder trimis
  const { data, error } = await supabaseAdmin
    .from('events')
    .select(`
      id,
      title,
      start_time,
      reminder_minutes_before,
      reminder_sent_whatsapp,
      profiles (
        full_name,
        phone_number,
        whatsapp_opt_in
      )
    `)
    .eq('reminder_sent_whatsapp', false)
    .gte('start_time', nowIso)
    .lte('start_time', twoHoursLaterIso);

  if (error) {
    console.error('Supabase error', error);
    return NextResponse.json({ ok: false, error: 'db error' }, { status: 500 });
  }

  const events = (data ?? []) as EventWithProfile[];

  const results: any[] = [];

  for (const event of events) {
    // ⚠️ AICI era problema:
    // event.profiles este un ARRAY, luăm primul element
    const profile = event.profiles?.[0];

    if (!profile) continue;
    if (!profile.phone_number || profile.whatsapp_opt_in === false) continue;

    const start = new Date(event.start_time);
    const reminderTime = new Date(
      start.getTime() - event.reminder_minutes_before * 60 * 1000
    );

    const diffMinutes =
      (now.getTime() - reminderTime.getTime()) / (60 * 1000);

    // trimitem doar dacă suntem în fereastra [0, REMINDER_WINDOW_MINUTES] după reminderTime
    if (diffMinutes >= 0 && diffMinutes <= REMINDER_WINDOW_MINUTES) {
      const body = `Salut${
        profile.full_name ? ' ' + profile.full_name : ''
      }! 👋
Îți reamintim că sesiunea "${event.title}" începe la ${start.toLocaleString()}.`;

      try {
        const msg = await client.messages.create({
          from: process.env.TWILIO_WHATSAPP_FROM!,
          // în DB păstrăm doar +407..., aici adăugăm prefixul "whatsapp:"
          to: `whatsapp:${profile.phone_number}`,
          body,
        });

        // marcăm că am trimis reminder-ul
        const { error: updateError } = await supabaseAdmin
          .from('events')
          .update({ reminder_sent_whatsapp: true })
          .eq('id', event.id);

        if (updateError) {
          console.error('update reminder_sent_whatsapp error', updateError);
        }

        results.push({ eventId: event.id, status: 'sent', sid: msg.sid });
      } catch (err) {
        console.error('Twilio error', err);
        results.push({ eventId: event.id, status: 'error' });
      }
    }
  }

  return NextResponse.json({ ok: true, results });
}
