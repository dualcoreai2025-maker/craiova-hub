// app/api/whatsapp-reminders/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

const REMINDER_WINDOW_MINUTES = 5; // rulezi cron la 5 minute

export async function GET() {
  const now = new Date();
  const nowIso = now.toISOString();

  // 1. Luăm evenimentele din următoarele 2 ore la care nu s-a trimis reminder
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();

  const { data: events, error } = await supabaseAdmin
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
    .lte('start_time', twoHoursLater);

  if (error) {
    console.error('Supabase error', error);
    return NextResponse.json({ error: 'db error' }, { status: 500 });
  }

  if (!events || events.length === 0) {
    return NextResponse.json({ message: 'no events' });
  }

  const results: any[] = [];

  for (const event of events) {
    const profile = event.profiles;
    if (!profile?.phone_number || profile?.whatsapp_opt_in === false) {
      continue;
    }

    const start = new Date(event.start_time);
    const reminderTime = new Date(
      start.getTime() - event.reminder_minutes_before * 60 * 1000
    );

    const diffMinutes =
      (now.getTime() - reminderTime.getTime()) / (60 * 1000);

    // trimitem dacă suntem în fereastra [-REMINDER_WINDOW, 0] minute
    if (
      diffMinutes >= 0 &&
      diffMinutes <= REMINDER_WINDOW_MINUTES
    ) {
      const body = `Salut${profile.full_name ? ' ' + profile.full_name : ''}! 👋
Îți reamintim că sesiunea "${event.title}" începe la ${start.toLocaleString()}.`;

      try {
        const msg = await client.messages.create({
          from: process.env.TWILIO_WHATSAPP_FROM!,
          to: `whatsapp:${profile.phone_number}`,
          body,
        });

        // marcăm în DB că am trimis reminder-ul
        const { error: updateError } = await supabaseAdmin
          .from('events')
          .update({ reminder_sent_whatsapp: true })
          .eq('id', event.id);

        if (updateError) {
          console.error('update error', updateError);
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
