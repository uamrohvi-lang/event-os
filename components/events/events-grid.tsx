"use client";

import { useState } from "react";
import Link from "next/link";
import type { Event } from "@/types/database";
import { CreateEventModal } from "./create-event-modal";

const PHASE_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  planning:       { label: "Pre-production", bg: "var(--green-l)",  color: "var(--green)" },
  pre_production: { label: "Pre-production", bg: "var(--green-l)",  color: "var(--green)" },
  build:          { label: "Build phase",    bg: "var(--amber-l)",  color: "var(--amber)" },
  rehearsal:      { label: "Rehearsal",      bg: "var(--amber-l)",  color: "var(--amber)" },
  live:           { label: "Live",           bg: "var(--red-l)",    color: "var(--red)" },
  strike:         { label: "Strike",         bg: "var(--bg)",       color: "var(--t3)" },
  closed:         { label: "Closed",         bg: "var(--bg)",       color: "var(--t3)" },
};

const EVENT_COLORS = [
  { bg: "var(--navy)" },
  { bg: "var(--teal)" },
  { bg: "var(--purple)" },
  { bg: "#993C1D" },
  { bg: "#185FA5" },
];

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function getDaysTo(dateStr: string | null) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  return diff;
}

interface EventsGridProps {
  events: Event[];
}

export function EventsGrid({ events }: EventsGridProps) {
  const [showCreate, setShowCreate] = useState(false);

  const activeEvents = events.filter((e) => !["closed", "strike"].includes(e.status));
  const blockedThreads = 2; // placeholder — would come from real data

  return (
    <>
      <div style={{ padding: 24, overflow: "auto", flex: 1 }}>
        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.4, color: "var(--t1)" }}>
            Good morning 👋
          </div>
          <div style={{ fontSize: 13, color: "var(--t3)", marginTop: 3 }}>
            Here&apos;s what needs your attention today
          </div>
        </div>

        {/* Stat row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 24 }}>
          <StatBlock val={String(activeEvents.length)} label="Active events" color="var(--navy)" />
          <StatBlock val="3" label="Critical vendor alerts" color="var(--red)" />
          <StatBlock val="2" label="Crew overloaded" color="var(--amber)" />
          <StatBlock val="312" label="People accredited" color="var(--green)" />
          <StatBlock
            val={events[0]?.start_date ? String(Math.max(0, getDaysTo(events[0].start_date) ?? 0)) : "—"}
            label={events[0] ? `Days to ${events[0].name.split(" ")[0]}` : "Days to event"}
            color="var(--navy)"
          />
        </div>

        {/* Main 2-col grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>

          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Events card */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--t2)", textTransform: "uppercase", letterSpacing: 0.6 }}>Your events</span>
                <button
                  className="btn btn-out btn-sm"
                  onClick={() => setShowCreate(true)}
                >
                  + New event
                </button>
              </div>

              {events.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "var(--t3)" }}>
                  <div style={{ fontSize: 13 }}>No events yet</div>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: 12 }}
                    onClick={() => setShowCreate(true)}
                  >
                    + Create first event
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {events.map((event, i) => {
                    const isActive = event.status === "live" || event.status === "build";
                    const phase = PHASE_BADGE[event.status] ?? PHASE_BADGE.planning;
                    const daysTo = getDaysTo(event.start_date);
                    const color = EVENT_COLORS[i % EVENT_COLORS.length].bg;
                    return (
                      <Link
                        key={event.id}
                        href={`/events/${event.id}`}
                        style={{
                          display: "flex", alignItems: "center", gap: 14,
                          padding: 14,
                          background: isActive ? "var(--teal-l)" : "var(--bg)",
                          borderRadius: 10,
                          border: `1px solid ${isActive ? "var(--teal)" : "var(--border)"}`,
                          cursor: "pointer",
                          textDecoration: "none",
                          transition: "border-color 0.15s",
                        }}
                      >
                        <div style={{
                          width: 40, height: 40, borderRadius: 9,
                          background: color,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0,
                        }}>
                          {getInitials(event.name)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>{event.name}</div>
                          <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>
                            {event.start_date && new Date(event.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                            {event.end_date && event.end_date !== event.start_date
                              ? ` – ${new Date(event.end_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
                              : ""}
                            {event.venue ? ` · ${event.venue}` : ""}
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 8,
                            background: phase.bg, color: phase.color,
                          }}>
                            {phase.label}
                          </span>
                          {daysTo != null && (
                            <span style={{ fontSize: 11, color: "var(--t3)", fontVariantNumeric: "tabular-nums" }}>
                              {daysTo > 0 ? `${daysTo} days` : daysTo === 0 ? "Today" : "Passed"}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Phase progress card */}
            {events[0] && (
              <div className="card">
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t2)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 16 }}>
                  {events[0].name.split(" ")[0]} — phase progress
                </div>
                {[
                  { label: "Pre-production", pct: 100, color: "var(--teal)" },
                  { label: "Venue & infrastructure", pct: 78, color: "var(--amber)" },
                  { label: "Vendor confirmations", pct: 62, color: "var(--red)" },
                  { label: "Team accreditation", pct: 85, color: "var(--teal)" },
                  { label: "Runsheet (Day 1)", pct: 45, color: "var(--purple)" },
                ].map(({ label, pct, color }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: "var(--t2)", flex: 1 }}>{label}</span>
                    <div style={{ flex: 2, height: 5, background: "var(--bg)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 4, width: `${pct}%`, background: color }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: pct === 100 ? color : "var(--t1)", minWidth: 32, textAlign: "right" }}>
                      {pct === 100 ? "Done" : `${pct}%`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Alerts */}
            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t2)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 14 }}>
                Alerts today
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <AlertItem color="red" title="StageCo — silent 4 days" desc="Rigging spec overdue. Critical path risk." pulse />
                <AlertItem color="red" title="G4S — contract unsigned" desc="Security contract not yet signed. Escalate today." />
                <AlertItem color="amber" title="Sara Reeves — overloaded" desc="8 open threads, 2 blocked. Review workload." />
                <AlertItem color="amber" title="8 crew without tier" desc="Cannot generate QR badges. Assign accreditation tiers." />
              </div>
            </div>

            {/* Quick actions */}
            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t2)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 12 }}>
                Quick actions
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <QuickAction icon="📋" title="Open runsheet" sub="Day 1 — Ctr. Stage" href="/runsheet" />
                <QuickAction icon="👥" title="Team workload" sub="12 people" href="/workload" />
                <QuickAction icon="🏢" title="Vendor alerts" sub="3 critical" href="/vendors" />
                <QuickAction icon="🔑" title="Zone access" sub="8 unassigned" href="/zones" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCreate && <CreateEventModal onClose={() => setShowCreate(false)} />}
    </>
  );
}

function StatBlock({ val, label, color }: { val: string; label: string; color: string }) {
  return (
    <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", padding: 16 }}>
      <div style={{ fontSize: 26, fontWeight: 600, fontVariantNumeric: "tabular-nums", marginBottom: 3, color }}>{val}</div>
      <div style={{ fontSize: 11, color: "var(--t3)" }}>{label}</div>
    </div>
  );
}

function AlertItem({ color, title, desc, pulse }: { color: "red" | "amber"; title: string; desc: string; pulse?: boolean }) {
  const bg = color === "red" ? "var(--red-l)" : "var(--amber-l)";
  const border = color === "red" ? "var(--red)" : "var(--amber)";
  const dot = color === "red" ? "var(--dot-red)" : "var(--dot-amber)";
  return (
    <div style={{ display: "flex", gap: 10, padding: "10px 12px", borderRadius: 9, background: bg, borderLeft: `3px solid ${border}` }}>
      <div className={pulse ? "pulse" : ""} style={{ width: 7, height: 7, borderRadius: "50%", background: dot, marginTop: 4, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--t1)" }}>{title}</div>
        <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 2, lineHeight: 1.4 }}>{desc}</div>
      </div>
    </div>
  );
}

function QuickAction({ icon, title, sub, href }: { icon: string; title: string; sub: string; href: string }) {
  return (
    <Link href={href} style={{
      padding: 12, background: "var(--bg)", borderRadius: 9,
      border: "1px solid var(--border)", cursor: "pointer",
      textDecoration: "none", display: "block",
      transition: "border-color 0.15s",
    }}>
      <div style={{ fontSize: 18, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--t1)" }}>{title}</div>
      <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 1 }}>{sub}</div>
    </Link>
  );
}