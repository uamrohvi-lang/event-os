"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, AlertTriangle, Brain } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type ThreadEntry = {
  id: string;
  content: string;
  created_at: string;
  ai_urgency: string | null;
  ai_sentiment: string | null;
  ai_suggested_action: string | null;
  ai_risk_keywords: string[] | null;
  ai_escalate: boolean | null;
  ai_processed: boolean;
};

type Thread = {
  id: string;
  title: string;
  status: string;
  urgency_level: string;
  owner: { id: string; full_name: string } | null;
};

interface ThreadPanelProps {
  // entries from the DB query are partial — cast to full type inside the component
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  thread: Omit<Thread, "urgency_level"> & { urgency_level?: string; entries: any[] };
  onBack?: () => void;
  onClose?: () => void;
  people?: { id: string; full_name: string }[];
}

export function ThreadPanel({ thread, onClose, onBack }: ThreadPanelProps) {
  const [entries, setEntries] = useState<ThreadEntry[]>(
    ([...(thread.entries ?? [])] as ThreadEntry[]).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
  );
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Realtime subscription — live updates from other team members
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`thread:${thread.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "thread_entries",
          filter: `thread_id=eq.${thread.id}`,
        },
        (payload) => {
          const newEntry = payload.new as ThreadEntry;
          setEntries((prev) => {
            // Ignore if already present (optimistic insert)
            if (prev.some((e) => e.id === newEntry.id)) return prev;
            return [...prev, newEntry];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "thread_entries",
          filter: `thread_id=eq.${thread.id}`,
        },
        (payload) => {
          const updated = payload.new as ThreadEntry;
          setEntries((prev) =>
            prev.map((e) => (e.id === updated.id ? updated : e))
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [thread.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || submitting) return;
    setSubmitting(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Optimistic insert
    const optimistic: ThreadEntry = {
      id: `opt-${Date.now()}`,
      content: content.trim(),
      created_at: new Date().toISOString(),
      ai_urgency: null,
      ai_sentiment: null,
      ai_suggested_action: null,
      ai_risk_keywords: null,
      ai_escalate: null,
      ai_processed: false,
    };
    setEntries((prev) => [...prev, optimistic]);
    setContent("");

    // Insert entry
    const { data: entry } = await supabase
      .from("thread_entries")
      .insert({
        thread_id: thread.id,
        author_id: user?.id ?? null,
        content: content.trim(),
      })
      .select()
      .single();

    if (entry) {
      setEntries((prev) =>
        prev.map((e) => (e.id === optimistic.id ? entry : e))
      );

      // Update last_entry_at on thread
      await supabase
        .from("activity_threads")
        .update({ last_entry_at: new Date().toISOString() })
        .eq("id", thread.id);

      // Trigger AI analysis asynchronously
      fetch(`/api/threads/${thread.id}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId: entry.id }),
      }).then(async (res) => {
        if (res.ok) {
          const analysed = await res.json();
          setEntries((prev) =>
            prev.map((e) => (e.id === entry.id ? { ...e, ...analysed } : e))
          );
        }
      });
    }

    setSubmitting(false);
  }

  return (
    <div className="flex flex-col h-full rounded-xl bg-white border border-[var(--color-border)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[var(--color-border)]">
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
            {thread.title}
          </h2>
          {thread.owner && (
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Owner: {thread.owner.full_name}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Entries */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {entries.length === 0 && (
          <p className="text-sm text-[var(--color-text-muted)] text-center py-8">
            No entries yet — add the first update below
          </p>
        )}
        {entries.map((entry) => (
          <EntryBubble key={entry.id} entry={entry} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[var(--color-border)] px-4 py-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as never);
              }
            }}
            rows={2}
            placeholder="Log an update… (Enter to send)"
            className="flex-1 resize-none rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-brand-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/20"
          />
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="rounded-lg px-3 py-2 text-white disabled:opacity-50 shrink-0 self-end"
            style={{ background: "var(--color-brand-teal)" }}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function EntryBubble({ entry }: { entry: ThreadEntry }) {
  const isOptimistic = entry.id.startsWith("opt-");

  return (
    <div className={cn("space-y-1", isOptimistic && "opacity-60")}>
      <div className="rounded-lg bg-[var(--color-surface-2)] px-3 py-2.5">
        <p className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap">
          {entry.content}
        </p>
        <p className="text-xs text-[var(--color-text-muted)] mt-1 tabular-nums">
          {new Date(entry.created_at).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {" · "}
          {new Date(entry.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          })}
        </p>
      </div>

      {/* AI analysis */}
      {entry.ai_processed && (
        <div className="pl-2 space-y-1">
          {entry.ai_escalate && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-signal-red)]">
              <AlertTriangle className="h-3 w-3 shrink-0" />
              <span className="font-medium">AI flagged for escalation</span>
            </div>
          )}
          {entry.ai_suggested_action && (
            <div className="flex items-start gap-1.5 text-xs text-[var(--color-text-secondary)]">
              <Brain className="h-3 w-3 shrink-0 mt-0.5 text-[var(--color-brand-purple)]" />
              <span>{entry.ai_suggested_action}</span>
            </div>
          )}
          {entry.ai_risk_keywords && entry.ai_risk_keywords.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {entry.ai_risk_keywords.map((kw) => (
                <span
                  key={kw}
                  className="rounded-full bg-[var(--color-signal-amber)]/10 px-1.5 py-px text-[10px] text-[var(--color-signal-amber)]"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
