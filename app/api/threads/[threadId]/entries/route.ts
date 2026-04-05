import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/server";

const client = new Anthropic();

// ============================================================
// Rules engine — fast, no AI tokens
// ============================================================
function rulesAnalysis(content: string): {
  urgency: "low" | "medium" | "high" | "critical";
  escalate: boolean;
  keywords: string[];
} {
  const lower = content.toLowerCase();

  const criticalPatterns = [
    /cancell/i, /catastroph/i, /emergency/i, /collapse/i,
    /serious injur/i, /hospital/i, /fatality/i, /evacuate/i,
  ];
  const highPatterns = [
    /blocked/i, /overdue/i, /urgent/i, /won.t be ready/i, /falling behind/i,
    /vendor pulled/i, /no show/i, /failed/i, /breach/i,
  ];
  const mediumPatterns = [
    /delay/i, /concern/i, /issue/i, /risk/i, /behind schedule/i,
    /waiting on/i, /escalat/i,
  ];

  const found: string[] = [];

  let urgency: "low" | "medium" | "high" | "critical" = "low";

  if (criticalPatterns.some((r) => r.test(lower))) {
    urgency = "critical";
    found.push(...criticalPatterns.filter((r) => r.test(lower)).map((r) => r.source.replace(/\//g, "").replace(/[\\^$.*+?()[\]{}|]/g, "")));
  } else if (highPatterns.some((r) => r.test(lower))) {
    urgency = "high";
    found.push(...highPatterns.filter((r) => r.test(lower)).map((r) => r.source.replace(/[\\^$.*+?()[\]{}|]/g, "").split(".")[0]));
  } else if (mediumPatterns.some((r) => r.test(lower))) {
    urgency = "medium";
  }

  return {
    urgency,
    escalate: urgency === "critical" || urgency === "high",
    keywords: found.slice(0, 5),
  };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params;
    const { entryId } = await request.json();

    if (!entryId) {
      return NextResponse.json({ error: "entryId required" }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // Fetch entry content
    const { data: entryRaw } = await supabase
      .from("thread_entries")
      .select("content, thread_id")
      .eq("id", entryId)
      .single();
    const entry = entryRaw as { content: string; thread_id: string } | null;

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    // Layer 1: rules engine (always runs)
    const rules = rulesAnalysis(entry.content);

    // Layer 2: LLM (only if API key present and content warrants it)
    let aiSuggested: string | null = null;
    let aiSentiment: "escalating" | "neutral" | "resolving" = "neutral";

    if (process.env.ANTHROPIC_API_KEY && rules.urgency !== "low") {
      try {
        const message = await client.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 256,
          messages: [
            {
              role: "user",
              content: `You are an event production assistant. Analyse this thread update and respond with a JSON object only.

Thread update: "${entry.content}"

Respond with exactly this JSON (no markdown):
{
  "suggested_action": "one short sentence describing the recommended next action",
  "sentiment": "escalating|neutral|resolving"
}`,
            },
          ],
        });

        const raw = (message.content[0] as { text: string }).text.trim();
        const parsed = JSON.parse(raw);
        aiSuggested = parsed.suggested_action ?? null;
        if (["escalating", "neutral", "resolving"].includes(parsed.sentiment)) {
          aiSentiment = parsed.sentiment;
        }
      } catch {
        // LLM failed — degrade gracefully to rules-only
      }
    }

    // Update entry with analysis
    const update = {
      ai_urgency: rules.urgency,
      ai_sentiment: aiSentiment,
      ai_suggested_action: aiSuggested,
      ai_risk_keywords: rules.keywords.length > 0 ? rules.keywords : null,
      ai_escalate: rules.escalate,
      ai_processed: true,
    };

    await supabase
      .from("thread_entries")
      .update(update)
      .eq("id", entryId);

    // Bubble urgency up to thread if higher
    if (rules.urgency === "critical" || rules.urgency === "high") {
      await supabase
        .from("activity_threads")
        .update({
          urgency_level: rules.urgency,
          sentiment: aiSentiment,
          ...(rules.escalate && rules.urgency === "critical" ? { status: "blocked" } : {}),
        })
        .eq("id", threadId);
    }

    return NextResponse.json(update);
  } catch (err) {
    console.error("Thread entry analysis error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
