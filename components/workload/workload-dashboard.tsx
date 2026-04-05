"use client";

import { Users } from "lucide-react";
import { cn, workloadSignal, initials, DEPT_COLOURS } from "@/lib/utils";

type PersonWithThreads = {
  id: string;
  full_name: string;
  role: string | null;
  department: string | null;
  threads: Array<{ id: string; status: string; urgency_level: string }>;
};

interface WorkloadDashboardProps {
  people: PersonWithThreads[];
}

export function WorkloadDashboard({ people }: WorkloadDashboardProps) {
  const overloaded = people.filter((p) => {
    const active = p.threads.filter((t) => t.status !== "resolved").length;
    const blocked = p.threads.filter((t) => t.status === "blocked").length;
    return workloadSignal(active, blocked) === "red";
  }).length;

  const busy = people.filter((p) => {
    const active = p.threads.filter((t) => t.status !== "resolved").length;
    const blocked = p.threads.filter((t) => t.status === "blocked").length;
    return workloadSignal(active, blocked) === "amber";
  }).length;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Workload</h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 tabular-nums">
            {people.length} people
            {overloaded > 0 && <span className="text-[var(--color-signal-red)]"> · {overloaded} overloaded</span>}
            {busy > 0 && <span className="text-[var(--color-signal-amber)]"> · {busy} busy</span>}
          </p>
        </div>
      </div>

      {people.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-border)] py-20 text-center">
          <Users className="h-10 w-10 text-[var(--color-border-strong)] mb-3" />
          <p className="text-sm text-[var(--color-text-muted)]">No team members yet</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Add people in the Team section
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {people.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      )}
    </>
  );
}

function PersonCard({ person }: { person: PersonWithThreads }) {
  const activeThreads = person.threads.filter((t) => t.status !== "resolved");
  const blockedThreads = person.threads.filter((t) => t.status === "blocked");
  const signal = workloadSignal(activeThreads.length, blockedThreads.length);

  const signalColour = {
    green: "var(--color-signal-green)",
    amber: "var(--color-signal-amber)",
    red:   "var(--color-signal-red)",
  }[signal];

  const signalLabel = {
    green: "Manageable",
    amber: "Busy",
    red:   "Overloaded",
  }[signal];

  const deptColour = person.department
    ? DEPT_COLOURS[person.department]
    : "var(--color-signal-grey)";

  return (
    <div className="rounded-xl bg-white border border-[var(--color-border)] p-4">
      {/* Avatar + name */}
      <div className="flex items-center gap-2.5 mb-3">
        <span
          className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
          style={{ background: deptColour }}
        >
          {initials(person.full_name)}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--color-text-primary)] truncate leading-tight">
            {person.full_name}
          </p>
          {(person.role || person.department) && (
            <p className="text-xs text-[var(--color-text-muted)] truncate leading-tight capitalize">
              {person.role ?? person.department}
            </p>
          )}
        </div>
      </div>

      {/* Workload signal */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: signalColour }}
          />
          <span className="text-xs font-medium" style={{ color: signalColour }}>
            {signalLabel}
          </span>
        </div>
        <span className="text-xs text-[var(--color-text-muted)] tabular-nums badge">
          {activeThreads.length} thread{activeThreads.length !== 1 ? "s" : ""}
          {blockedThreads.length > 0 && (
            <span className="text-[var(--color-signal-red)]">
              {" "}· {blockedThreads.length} blocked
            </span>
          )}
        </span>
      </div>

      {/* Critical threads indicator */}
      {person.threads.some((t) => t.urgency_level === "critical") && (
        <div className="mt-2 text-[10px] font-medium text-[var(--color-signal-red)] bg-[var(--color-signal-red)]/5 rounded-md px-2 py-1">
          Critical thread active
        </div>
      )}
    </div>
  );
}
