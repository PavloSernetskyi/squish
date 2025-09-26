import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const event = await req.json();
    const type = event.type;

    const sb = supabaseServer();

    if (type === "call.started") {
      const c = event.data;
      await sb.from("voice_calls").upsert({
        vapi_call_id: c.id,
        started_at: c.startedAt ? new Date(c.startedAt).toISOString() : null,
        intent: c.metadata?.intent ?? null,
      }, { onConflict: "vapi_call_id" });
    }

    if (type === "call.ended") {
      const c = event.data;
      const started = new Date(c.startedAt).getTime();
      const ended = new Date(c.endedAt).getTime();
      await sb.from("voice_calls")
        .update({
          ended_at: new Date(c.endedAt).toISOString(),
          duration_sec: Math.max(0, Math.floor((ended - started) / 1000)),
          summary: c.summary ?? null,
        })
        .eq("vapi_call_id", c.id);
    }

    if (type === "transcript.available") {
      const { callId, transcript } = event.data;
      await sb.from("voice_calls").update({ transcript }).eq("vapi_call_id", callId);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
