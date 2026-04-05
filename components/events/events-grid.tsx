"use client";

import { useState } from "react";
import { Plus, CalendarDays, MapPin } from "lucide-react";
import type { Event } from "@/types/database";
import { formatDate, cn } from "@/lib/utils";
import { CreateEventModal } from "./create-event-modal";

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  planning:       { label: "Planning",       bg: "bg-[var(--color-signal-blue)]/10",  text: "text-[var(--color-signal-blue)]" },
  pre_production: { label: "Pre-production", bg: "bg-[var(--color-brand-purple)]/10", text: "text-[var(--color-brand-purple)]" },
  build:          { label: "Build",          bg: "bg-[var(--color-signal-amber)]/10", text: "text-[var(--color-signal-amber)]" },
  rehearsal:      { label: "Rehearsal",      bg: "bg-[var(--color-signal-amber)]/15", text: "text-[var(--color-signal-amber)]" },
  live:           { label: "Live",           bg: "bg-[var(--color-signal-green)]/10", text: "text-[var(--color-signal-green)]" },
  strike:         { label: "Strike",         bg: "bg-[var(--color-signal-grey)]/10",  text: "text-[var(--color-signal-grey)]" },
  closed:         { label: "Closed",         bg: "bg-[var(--color-surface-3)]",       text: "text-[var(--color-text-muted)]" },
};

interface EventsGridProps {
  events: Event[];
}

export function EventsGrid({ events }: EventsGridProps) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Events</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            {events.length} event{events.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: "var(--color-brand-teal)" }}
        >
          <Plus className="h-4 w-4" />
          New event
        </button>
      </div>

      {/* Grid */}
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-border)] py-20 text-center">
          <CalendarDays className="h-10 w-10 text-[var(--color-border-strong)] mb-3" />
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">No events yet</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 mb-4">
            Create your first event to get started
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white"
            style={{ background: "var(--color-brand-teal)" }}
          >
            <Plus className="h-4 w-4" />
            New event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateEventModal onClose={() => setShowCreate(false)} />
      )}
    </>
  );
}

function EventCard({ event }: { event: Event }) {
  const status = STATUS_STYLES[event.status] ?? STATUS_STYLES.planning;

  return (
    <a
      href={`/events/${event.id}`}
      className="group block rounded-xl bg-white border border-[var(--color-border)] p-5 transition-shadow hover:shadow-md"
    >
      {/* Status badge */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
            status.bg,
            status.text
          )}
        >
          {status.label}
        </span>
        <span className="text-xs text-[var(--color-text-muted)] capitalize">
          {event.type.replace("_", " ")}
        </span>
      </div>

      {/* Name */}
      <h3 className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-teal)] transition-colors line-clamp-2 mb-3">
        {event.name}
      </h3>

      {/* Meta */}
      <div className="space-y-1.5">
        {(event.start_date || event.end_date) && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
            <CalendarDays className="h-3.5 w-3.5 text-[var(--color-text-muted)] shrink-0" />
            <span className="tabular-nums">
              {formatDate(event.start_date)}
              {event.end_date && event.end_date !== event.start_date
                ? ` — ${formatDate(event.end_date)}`
                : ""}
            </span>
          </div>
        )}
        {event.venue && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
            <MapPin className="h-3.5 w-3.5 text-[var(--color-text-muted)] shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        )}
      </div>
    </a>
  );
}
