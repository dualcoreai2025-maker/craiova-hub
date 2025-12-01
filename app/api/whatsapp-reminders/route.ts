// app/api/whatsapp-reminders/route.ts
import { NextResponse } from "next/server";
import twilio from "twilio";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

const WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM!;

// vrem reminder cu 5 minute înainte
const REMINDER_MINUTES = 5;
// fereastra în care considerăm că e „momentul potrivit”
const WINDOW_MINUTES = 1; // job-ul rulează la fiecare minut

export async function GET() {
  const now = new Date();
  const from = new Date(now.getTime() + REMINDER_MINUTES * 60_000);
  const to = new Date(from.getTime() + WINDOW_MINUTES * 60_000);

  try {
    // 1️⃣ Luăm evenimentele care încep peste 5–6 minute și nu au reminder trimis
    const { data: events, error } = await supabaseAdmin
      .from("events")
      .select(
        `
        id,
        title,
        start_time,
        reminder_sent_whatsapp,
        reminder_minutes_before,
        profiles (
          id,
          full_name,
          phone_number,
          whatsapp_opt_in
        )
      `
      )
      .eq("reminder_sent_whatsapp", false)
      .gte("start_time", from.toISOString())
      .lt("start_time", to.toISOString());

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let sent = 0;

    for (const ev of events ?? []) {
      const profile: any = (ev as any).profiles;

      // dacă nu avem număr de telefon sau nu vrea WhatsApp, sărim
      if (!profile || !profile.phone_number || profile.whatsapp_opt_in === false) {
        continue;
      }

      const start = new Date((ev as any).start_time);
      const minutesBefore =
        (ev as any).reminder_minutes_before ?? REMINDER_MINUTES;

      const ora = start.toLocaleTimeString("ro-RO", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const toWhatsApp = `whatsapp:${profile.phone_number}`; // 🔹 AICI "whatsapp:" e STRING
      const body = `Salut${
        profile.full_name ? " " + profile.full_name : ""
      }! 👋 Evenimentul "${(ev as any).title}" începe la ${ora} (în aproximativ ${minutesBefore} minute).`;

      try {
        await twilioClient.messages.create({
          from: WHATSAPP_FROM,
          to: toWhatsApp,
          body,
        });

        await supabaseAdmin
          .from("events")
          .update({ reminder_sent_whatsapp: true })
          .eq("id", (ev as any).id);

        sent++;
      } catch (err) {
        console.error("Twilio error pentru event", (ev as any).id, err);
      }
    }

    return NextResponse.json({ ok: true, sent });
  } catch (err: any) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
