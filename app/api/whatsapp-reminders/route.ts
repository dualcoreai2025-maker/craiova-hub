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
const WINDOW_MINUTES = 1;   // endpoint-ul e chemat în fiecare minut de cron

export async function GET() {
  const now = new Date();
  const from = new Date(now.getTime() + REMINDER_MINUTES * 60_000);
  const to = new Date(from.getTime() + WINDOW_MINUTES * 60_000);

  try {
    // 1️⃣ Evenimente care încep peste 5–6 minute și nu au reminder trimis
    const { data: events, error: eventsError } = await supabaseAdmin
      .from("events")
      .select("id, title, start_time, reminder_sent_whatsapp")
      .eq("reminder_sent_whatsapp", false)
      .gte("start_time", from.toISOString())
      .lt("start_time", to.toISOString());

    if (eventsError) {
      console.error("Supabase events error:", eventsError);
      return NextResponse.json({ error: eventsError.message }, { status: 500 });
    }

    if (!events || events.length === 0) {
      return NextResponse.json({ ok: true, sent: 0, message: "no events in window" });
    }

    // 2️⃣ Toți userii care vor notificări pe WhatsApp și au telefon
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, phone_number, whatsapp_opt_in")
      .eq("whatsapp_opt_in", true)
      .not("phone_number", "is", null);

    if (profilesError) {
      console.error("Supabase profiles error:", profilesError);
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    if (!profiles || profiles.length === 0) {
      // nimeni nu e înscris -> doar ieșim, dar marcăm totuși ca ne-trimis?
      // eu prefer să nu marcăm eventele, ca să fie trimise când apar useri noi
      return NextResponse.json({ ok: true, sent: 0, message: "no subscribed profiles" });
    }

    let sentCount = 0;

    // 3️⃣ Pentru fiecare eveniment, trimitem la TOȚI userii abonați
    for (const ev of events as any[]) {
      const start = new Date(ev.start_time);
      const ora = start.toLocaleTimeString("ro-RO", {
        hour: "2-digit",
        minute: "2-digit",
      });

      for (const profile of profiles as any[]) {
        const toWhatsApp = `whatsapp:${profile.phone_number}`;

        const body = `Salut${
          profile.full_name ? " " + profile.full_name : ""
        }! 👋 Evenimentul "${ev.title}" începe la ${ora} (în ~${REMINDER_MINUTES} minute).`;

        try {
          const msg = await twilioClient.messages.create({
            from: WHATSAPP_FROM,
            to: toWhatsApp,
            body,
          });

          sentCount++;

          // Dacă ai tabela notifications, poți loga aici:
          // await supabaseAdmin.from("notifications").insert({
          //   event_id: ev.id,
          //   profile_id: profile.id,
          //   channel: "whatsapp",
          //   message: body,
          //   status: msg.status ?? "queued",
          //   error_code: msg.errorCode ? String(msg.errorCode) : null,
          // });
        } catch (err) {
          console.error(
            "Twilio error pentru event",
            ev.id,
            "profil",
            profile.id,
            err
          );

          // și aici poți loga eroarea în notifications dacă vrei
        }
      }

      // 4️⃣ după ce am trimis la TOȚI userii pentru eventul ăsta,
      // îl marcăm ca "reminder trimis"
      await supabaseAdmin
        .from("events")
        .update({ reminder_sent_whatsapp: true })
        .eq("id", ev.id);
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
