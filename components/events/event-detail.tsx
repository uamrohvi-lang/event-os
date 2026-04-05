"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, CalendarDays, MapPin } from "lucide-react";
import type { Event, Phase, Task } from "@/types/database";
import { formatDate, cn } from "@/lib/utils";

const STATUS_COLOURS: Record<string, string> = {
  pending:  "bg-[var(--color-surface-3)] text-[var(--color-text-muted)]",
  active:   "bg-[var(--color-signal-green)]/10 text-[var(--color-signal-green)]",
  complete: "bg-[var(--color-brand-teal)]/10 text-[var(--color-brand-teal)]",
};

const TASK_STATUS_COLOURS: Record<string, string> = {
  todo:        "bg-[var(--color-surface-3)] text-[var(--color-text-muted)]",
  in_progress: "bg-[var(--color-signal-blue)]/10 text-[var(--color-signal-blue)]",
  blocked:     "bg-[var(--color-signal-red)]/10 text-[var(--color-signal-red)]",
  done:        "bg-[var(--color-signal-green)]/10 text-[var(--color-signal-green)]",
  cancelled:   "bg-[var(--color-surface-3)] text-[var(--color-text-muted)]",
};

interface EventDetailProps {
  event: Event;
  phases: Phase[];
  tasks: Task[];
}

export function EventDetail({ event, phases, tasks }: EventDetailProps) {
  const [activeTab, setActiveTab] = useState<"phases" | "tasks">("phases");

  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const blockedTasks = tasks.filter((t) => t.status === "blocked").length;

  return (
    <div className="p-6 max-w-5xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] mb-4">
        <Link href="/" className="hover:text-[var(--color-text-primary)] transition-colors">
          Events
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-[var(--color-text-secondary)]">{event.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-1">
              {event.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-secondary)]">
              {event.venue && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                  {event.venue}
                </span>
              )}
              {(event.start_date || event.end_date) && (
                <span className="flex items-center gap-1 tabular-nums">
                  <CalendarDays className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                  {formatDate(event.start_date)}
                  {event.end_date && event.end_date !== event.start_date
                    ? ` — ${formatDate(event.end_date)}`
                    : ""}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-4 mt-4">
          <Stat label="Phases" value={phases.length} />
          <Stat label="Tasks" value={tasks.length} />
          <Stat label="Done" value={doneTasks} colour="var(--color-signal-green)" />
          {blockedTasks > 0 && (
            <Stat label="Blocked" value={blockedTasks} colour="var(--color-signal-red)" />
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-[var(--color-border)]">
        {(["phases", "tasks"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-3 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px",
              activeTab === tab
                ? "border-[var(--color-brand-teal)] text-[var(--color-brand-teal)]"
                : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "phases" && (
        <div className="space-y-2">
          {phases.map((phase, idx) => (
            <div
              key={phase.id}
              className="flex items-center gap-3 rounded-xl bg-white border border-[var(--color-border)] px-4 py-3"
            >
              <span className="text-xs font-medium tabular-nums text-[var(--color-text-muted)] w-5">
                {idx + 1}
              </span>
              <span className="flex-1 text-sm font-medium text-[var(--color-text-primary)]">
                {phase.name}
              </span>
              {(phase.start_date || phase.end_date) && (
                <span className="text-xs text-[var(--color-text-muted)] tabular-nums">
                  {formatDate(phase.start_date)}
                  {phase.end_date ? ` — ${formatDate(phase.end_date)}` : ""}
                </span>
              )}
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                  STATUS_COLOURS[phase.status]
                )}
              >
                {phase.status}
              </span>
            </div>
          ))}
          {phases.length === 0 && (
            <p className="text-sm text-[var(--color-text-muted)] py-4 text-center">
              No phases yet
            </p>
          )}
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 rounded-xl bg-white border border-[var(--color-border)] px-4 py-3"
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full shrink-0",
                  task.priority === "critical" ? "bg-[var(--color-signal-red)]"
                  : task.priority === "high" ? "bg-[var(--color-signal-amber)]"
                  : "bg-[var(--color-border-strong)]"
                )}
              />
              <span className="flex-1 text-sm text-[var(--color-text-primary)]">
                {task.title}
              </span>
              {task.due_date && (
                <span className="text-xs text-[var(--color-text-muted)] tabular-nums">
                  {formatDate(task.due_date)}
                </span>
              )}
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  TASK_STATUS_COLOURS[task.status]
                )}
              >
                {task.status.replace("_", " ")}
              </span>
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="text-sm text-[var(--color-text-muted)] py-4 text-center">
              No tasks yet
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  colour,
}: {
  label: string;
  value: number;
  colour?: string;
}) {
  return (
    <div className="rounded-lg bg-white border border-[var(--color-border)] px-3 py-2 min-w-[72px]">
      <p className="text-lg font-semibold tabular-nums" style={{ color: colour ?? "var(--color-text-primary)" }}>
        {value}
      </p>
      <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
    </div>
  );
}
