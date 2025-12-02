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

const REMINDER_MINUTES = 5; // cu cât timp înainte
const WINDOW_MINUTES = 1;   // rulăm endpoint-ul la fiecare minut

export async function GET() {
  const now = new Date();
  const from = new Date(now.getTime() + REMINDER_MINUTES * 60_000);
  const to = new Date(from.getTime() + WINDOW_MINUTES * 60_000);

  try {
    // 1️⃣ Event-uri care încep peste 5–6 minute și nu au reminder trimis
    const { data: events, error: eventsError } = await supabaseAdmin
      .from("events")
      .select("id, title, start_time, reminder_sent_whatsapp, profile_id")
      .eq("reminder_sent_whatsapp", false)
      .not("profile_id", "is", null)
      .gte("start_time", from.toISOString())
      .lt("start_time", to.toISOString());

    if (eventsError) {
      console.error("Supabase events error:", eventsError);
      return NextResponse.json({ error: eventsError.message }, { status: 500 });
    }

    if (!events || events.length === 0) {
      return NextResponse.json({ ok: true, sent: 0, message: "no events in window" });
    }

    let sentCount = 0;

    for (const ev of events as any[]) {
      // 2️⃣ Luăm profilul asociat (fără .single())
      const { data: profiles, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, phone_number, whatsapp_opt_in")
        .eq("id", ev.profile_id);

      if (profileError) {
        console.error("Supabase profiles error:", profileError);
        continue;
      }

      const profile = profiles && profiles[0];
      if (!profile) {
        console.warn("No profile found for event", ev.id);
        continue;
      }

      if (!profile.phone_number) {
        console.warn("No phone_number for profile", profile.id);
        continue;
      }

      if (profile.whatsapp_opt_in === false) {
        console.warn("User opted out of WhatsApp", profile.id);
        continue;
      }

      const toWhatsApp = `whatsapp:${profile.phone_number}`;

      const start = new Date(ev.start_time);
      const ora = start.toLocaleTimeString("ro-RO", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const body = `Salut${
        profile.full_name ? " " + profile.full_name : ""
      }! 👋 Evenimentul "${ev.title}" începe la ${ora} (în ~${REMINDER_MINUTES} minute).`;

      try {
        await twilioClient.messages.create({
          from: WHATSAPP_FROM,
          to: toWhatsApp,
          body,
        });

        await supabaseAdmin
          .from("events")
          .update({ reminder_sent_whatsapp: true })
          .eq("id", ev.id);

        sentCount++;
      } catch (err) {
        console.error("Twilio error pentru event", ev.id, err);
      }
    }

    return NextResponse.json({ ok: true, sent: sentCount });
  } catch (err: any) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
