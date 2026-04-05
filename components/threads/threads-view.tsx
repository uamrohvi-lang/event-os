"use client";

import { useState } from "react";
import { MessageSquare, Plus, Clock, AlertTriangle } from "lucide-react";
import { cn, DEPT_COLOURS, initials } from "@/lib/utils";
import { ThreadPanel } from "./thread-panel";

type ThreadWithDetails = {
  id: string;
  title: string;
  status: string;
  urgency_level: string;
  sentiment: string;
  is_silent: boolean;
  last_entry_at: string | null;
  event_id: string;
  owner: { id: string; full_name: string; department: string | null } | null;
  entries: Array<{
    id: string;
    content: string;
    created_at: string;
    ai_urgency: string | null;
    ai_escalate: boolean | null;
  }>;
};

const STATUS_DOT: Record<string, string> = {
  in_progress: "bg-[var(--color-signal-blue)]",
  waiting:     "bg-[var(--color-signal-amber)]",
  blocked:     "bg-[var(--color-signal-red)]",
  resolved:    "bg-[var(--color-signal-green)]",
};

const URGENCY_BORDER: Record<string, string> = {
  low:      "border-[var(--color-border)]",
  medium:   "border-[var(--color-signal-amber)]/40",
  high:     "border-[var(--color-signal-red)]/40",
  critical: "border-[var(--color-signal-red)]",
};

interface ThreadsViewProps {
  threads: ThreadWithDetails[];
}

export function ThreadsView({ threads: initialThreads }: ThreadsViewProps) {
  const [threads] = useState(initialThreads);
  const [selected, setSelected] = useState<ThreadWithDetails | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = filterStatus === "all"
    ? threads
    : threads.filter((t) => t.status === filterStatus);

  const activeCount = threads.filter((t) => t.status !== "resolved").length;
  const blockedCount = threads.filter((t) => t.status === "blocked").length;

  return (
    <div className="flex gap-6 h-[calc(100vh-3rem)]">
      {/* Left column — thread list */}
      <div className="flex flex-col w-96 shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Activity</h1>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 tabular-nums">
              {activeCount} active{blockedCount > 0 ? ` · ${blockedCount} blocked` : ""}
            </p>
          </div>
          <button
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white"
            style={{ background: "var(--color-brand-teal)" }}
          >
            <Plus className="h-4 w-4" />
            New thread
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-3">
          {["all", "in_progress", "waiting", "blocked", "resolved"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium transition-colors capitalize",
                filterStatus === s
                  ? "bg-[var(--color-brand-navy)] text-white"
                  : "bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"
              )}
            >
              {s === "all" ? "All" : s.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessageSquare className="h-8 w-8 text-[var(--color-border-strong)] mb-2" />
              <p className="text-sm text-[var(--color-text-muted)]">No threads</p>
            </div>
          )}
          {filtered.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              isSelected={selected?.id === thread.id}
              onClick={() => setSelected(selected?.id === thread.id ? null : thread)}
            />
          ))}
        </div>
      </div>

      {/* Right column — thread panel */}
      {selected ? (
        <div className="flex-1 overflow-hidden">
          <ThreadPanel thread={selected} onClose={() => setSelected(null)} />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-border)]">
          <p className="text-sm text-[var(--color-text-muted)]">
            Select a thread to view activity
          </p>
        </div>
      )}
    </div>
  );
}

function ThreadCard({
  thread,
  isSelected,
  onClick,
}: {
  thread: ThreadWithDetails;
  isSelected: boolean;
  onClick: () => void;
}) {
  const latestEntry = thread.entries?.[0];
  const hasEscalation = thread.entries?.some((e) => e.ai_escalate);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-xl border bg-white px-4 py-3 transition-shadow hover:shadow-sm",
        URGENCY_BORDER[thread.urgency_level],
        isSelected && "ring-2 ring-[var(--color-brand-teal)]/40"
      )}
    >
      <div className="flex items-start gap-2.5">
        {/* Status dot */}
        <span
          className={cn(
            "mt-1.5 h-2 w-2 rounded-full shrink-0",
            STATUS_DOT[thread.status]
          )}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
              {thread.title}
            </p>
            {hasEscalation && (
              <AlertTriangle className="h-3.5 w-3.5 text-[var(--color-signal-red)] shrink-0" />
            )}
          </div>

          {thread.owner && (
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className="h-4 w-4 rounded-full flex items-center justify-center text-white text-[9px] font-semibold shrink-0"
                style={{
                  background: thread.owner.department
                    ? DEPT_COLOURS[thread.owner.department]
                    : "var(--color-signal-grey)",
                }}
              >
                {initials(thread.owner.full_name)}
              </span>
              <span className="text-xs text-[var(--color-text-muted)] truncate">
                {thread.owner.full_name}
              </span>
            </div>
          )}

          {latestEntry && (
            <p className="text-xs text-[var(--color-text-muted)] mt-1.5 line-clamp-2">
              {latestEntry.content}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-[var(--color-text-muted)] tabular-nums flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {thread.entries?.length ?? 0} entr{thread.entries?.length === 1 ? "y" : "ies"}
            </span>
            {thread.urgency_level !== "low" && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-px text-[10px] font-medium capitalize",
                  thread.urgency_level === "critical"
                    ? "bg-[var(--color-signal-red)]/10 text-[var(--color-signal-red)]"
                    : thread.urgency_level === "high"
                    ? "bg-[var(--color-signal-amber)]/10 text-[var(--color-signal-amber)]"
                    : "bg-[var(--color-signal-blue)]/10 text-[var(--color-signal-blue)]"
                )}
              >
                {thread.urgency_level}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
