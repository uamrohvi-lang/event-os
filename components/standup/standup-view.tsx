"use client";

import { useState } from "react";
import { ClipboardList, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { initials, DEPT_COLOURS, cn } from "@/lib/utils";

type StandupEntry = {
  id: string;
  person_id: string;
  entry_date: string;
  yesterday_text: string | null;
  today_text: string | null;
  blocked_text: string | null;
  person: { id: string; full_name: string; department: string | null } | null;
};

interface StandupViewProps {
  entries: StandupEntry[];
  myPersonId: string | null;
  today: string;
}

export function StandupView({ entries, myPersonId, today }: StandupViewProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [yesterday, setYesterday] = useState("");
  const [todayText, setTodayText] = useState("");
  const [blocked, setBlocked] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const myEntry = entries.find((e) => e.person_id === myPersonId);
  const hasSubmitted = !!myEntry;

  const formattedDate = new Date(today).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!myPersonId) return;
    setSubmitting(true);
    setError(null);

    const supabase = createClient();

    // Get event_id — use first event available
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("users")
      .select("organisation_id")
      .eq("id", user?.id ?? "")
      .single();

    const { data: events } = await supabase
      .from("events")
      .select("id")
      .eq("organisation_id", profile?.organisation_id ?? "")
      .limit(1);

    if (!events?.[0]) {
      setError("No event found — create an event first");
      setSubmitting(false);
      return;
    }

    const { error: err } = await supabase
      .from("standup_entries")
      .upsert({
        event_id: events[0].id,
        person_id: myPersonId,
        entry_date: today,
        yesterday_text: yesterday || null,
        today_text: todayText || null,
        blocked_text: blocked || null,
      }, { onConflict: "event_id,person_id,entry_date" });

    if (err) {
      setError(err.message);
      setSubmitting(false);
      return;
    }

    setShowForm(false);
    router.refresh();
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Standup</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{formattedDate}</p>
        </div>
        {myPersonId && !hasSubmitted && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white"
            style={{ background: "var(--color-brand-teal)" }}
          >
            <ClipboardList className="h-4 w-4" />
            Submit standup
          </button>
        )}
      </div>

      {/* My standup form */}
      {showForm && (
        <div className="rounded-xl bg-white border border-[var(--color-brand-teal)]/30 p-5 mb-6">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
            Your standup for today
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                What did you do yesterday?
              </label>
              <textarea
                value={yesterday}
                onChange={(e) => setYesterday(e.target.value)}
                rows={2}
                className={textareaCls}
                placeholder="Completed venue walkthrough, confirmed AV supplier…"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                What are you doing today?
              </label>
              <textarea
                value={todayText}
                onChange={(e) => setTodayText(e.target.value)}
                rows={2}
                className={textareaCls}
                placeholder="Finalise catering brief, brief production crew…"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                Any blockers?
              </label>
              <textarea
                value={blocked}
                onChange={(e) => setBlocked(e.target.value)}
                rows={1}
                className={cn(
                  textareaCls,
                  blocked && "border-[var(--color-signal-amber)] focus:border-[var(--color-signal-amber)]"
                )}
                placeholder="None — or describe what's blocking you"
              />
            </div>
            {error && <p className="text-sm text-[var(--color-signal-red)]">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]">Cancel</button>
              <button type="submit" disabled={submitting} className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" style={{ background: "var(--color-brand-teal)" }}>
                {submitting ? "Submitting…" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Entries list */}
      <div className="space-y-3">
        {entries.length === 0 && !showForm && (
          <div className="text-center py-12 text-sm text-[var(--color-text-muted)]">
            No standups submitted yet today
          </div>
        )}
        {entries.map((entry) => (
          <StandupCard key={entry.id} entry={entry} isMyEntry={entry.person_id === myPersonId} />
        ))}
      </div>
    </>
  );
}

function StandupCard({ entry, isMyEntry }: { entry: StandupEntry; isMyEntry: boolean }) {
  const deptColour = entry.person?.department
    ? DEPT_COLOURS[entry.person.department]
    : "var(--color-signal-grey)";

  return (
    <div
      className={cn(
        "rounded-xl bg-white border p-4",
        isMyEntry ? "border-[var(--color-brand-teal)]/40" : "border-[var(--color-border)]"
      )}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <span
          className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
          style={{ background: deptColour }}
        >
          {entry.person ? initials(entry.person.full_name) : "?"}
        </span>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            {entry.person?.full_name ?? "Unknown"}
          </span>
          {isMyEntry && (
            <CheckCircle className="h-3.5 w-3.5 text-[var(--color-brand-teal)]" />
          )}
        </div>
      </div>

      <div className="space-y-2.5">
        {entry.yesterday_text && (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)] mb-0.5">Yesterday</p>
            <p className="text-sm text-[var(--color-text-secondary)]">{entry.yesterday_text}</p>
          </div>
        )}
        {entry.today_text && (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)] mb-0.5">Today</p>
            <p className="text-sm text-[var(--color-text-secondary)]">{entry.today_text}</p>
          </div>
        )}
        {entry.blocked_text && (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-signal-amber)] mb-0.5">Blocked</p>
            <p className="text-sm text-[var(--color-signal-red)]">{entry.blocked_text}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const textareaCls =
  "w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm resize-none focus:border-[var(--color-brand-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/20";
