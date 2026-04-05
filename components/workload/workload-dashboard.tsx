"use client";

import { useState } from "react";
import Link from "next/link";

type Signal = "red" | "amber" | "green";

interface PersonData {
  id: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  name: string;
  role: string;
  signal: Signal;
  signalLabel: string;
  pct: number;
  tags: { label: string; type: "task" | "thread" | "block" | "silent" }[];
  standup: string;
  flag?: string;
}

const MOCK_PEOPLE: PersonData[] = [
  {
    id: "1", initials: "SR", avatarBg: "#FAECE7", avatarColor: "#712B13",
    name: "Sara Reeves", role: "Production coordinator",
    signal: "red", signalLabel: "Overloaded", pct: 91,
    tags: [
      { label: "8 tasks", type: "task" }, { label: "6 threads", type: "thread" },
      { label: "2 blocked", type: "block" }, { label: "1 silent 4d", type: "silent" },
    ],
    standup: "Still waiting on AV rigging spec from StageCo. Chased again this morning. Also need sign-off on catering brief.",
    flag: "Blocked on two external sign-offs",
  },
  {
    id: "2", initials: "TM", avatarBg: "#E6F1FB", avatarColor: "#0C447C",
    name: "Tom Mackenzie", role: "Logistics lead",
    signal: "amber", signalLabel: "Busy — check in", pct: 68,
    tags: [
      { label: "5 tasks", type: "task" }, { label: "4 threads", type: "thread" },
      { label: "1 silent 2d", type: "silent" },
    ],
    standup: "Working through transport schedule for speaker transfers. Should have draft to Lena by EOD. Freight customs still outstanding.",
  },
  {
    id: "3", initials: "LO", avatarBg: "#E1F5EE", avatarColor: "#085041",
    name: "Lena Obi", role: "Speaker & talent liaison",
    signal: "green", signalLabel: "Manageable", pct: 44,
    tags: [
      { label: "4 tasks", type: "task" }, { label: "3 threads", type: "thread" },
    ],
    standup: "Confirmed 14 of 18 speakers on travel. Still pending: keynote slot 2 (visa issue), two remote panellists TBC.",
  },
  {
    id: "4", initials: "DK", avatarBg: "#EEEDFE", avatarColor: "#3C3489",
    name: "Dan Kim", role: "Venue & infrastructure",
    signal: "green", signalLabel: "Light — capacity available", pct: 28,
    tags: [
      { label: "2 tasks", type: "task" }, { label: "2 threads", type: "thread" },
    ],
    standup: "Venue floorplan v4 approved. Waiting on electrical load sheet from venue. Relatively free this afternoon.",
  },
];

const TAG_STYLES: Record<string, { bg: string; color: string }> = {
  task:   { bg: "#E6F1FB", color: "#0C447C" },
  thread: { bg: "var(--purple-l)", color: "var(--purple)" },
  block:  { bg: "var(--red-l)", color: "var(--red)" },
  silent: { bg: "var(--amber-l)", color: "var(--amber)" },
};

const SIGNAL_STYLES: Record<Signal, { border: string; badge: string; badgeColor: string; bar: string }> = {
  red:   { border: "var(--red)",   badge: "var(--red-l)",   badgeColor: "var(--red)",   bar: "var(--red)" },
  amber: { border: "var(--amber)", badge: "var(--amber-l)", badgeColor: "var(--amber)", bar: "var(--amber)" },
  green: { border: "var(--green)", badge: "var(--green-l)", badgeColor: "var(--green)", bar: "#639922" },
};

const TABS = ["Workload view", "Shift schedule", "Zone & access", "Standups"];

export function WorkloadDashboard() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Topbar */}
      <div style={{
        height: 54, background: "var(--surface)", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", padding: "0 24px", gap: 12, flexShrink: 0,
      }}>
        <span style={{ fontSize: 15, fontWeight: 600 }}>Team Workload</span>
        <span style={{ fontSize: 12, color: "var(--t3)" }}>12 people</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <button className="btn btn-out btn-sm">+ Add person</button>
          <div className="av">SR</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map((tab, i) => (
          <div
            key={tab}
            className={`tab${activeTab === i ? " active" : ""}`}
            onClick={() => setActiveTab(i)}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
        {activeTab === 0 && (
          <>
            {/* Stat row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 20 }}>
              <Stat val="2" label="Overloaded" color="var(--red)" />
              <Stat val="3" label="Busy — check in" color="var(--amber)" />
              <Stat val="7" label="Manageable" color="var(--green)" />
              <Stat val="5" label="Blocked threads" color="var(--red)" />
              <Stat val="3" label="Silent vendors" color="var(--amber)" />
            </div>

            {/* Person grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {MOCK_PEOPLE.map((p) => (
                <PersonCard key={p.id} person={p} />
              ))}
            </div>
          </>
        )}

        {activeTab === 1 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--t3)" }}>
            <div style={{ fontSize: 13 }}>
              <Link href="/team/shifts" style={{ color: "var(--navy)", fontWeight: 500 }}>Open Shift Scheduler →</Link>
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--t3)", fontSize: 13 }}>
            Zone &amp; access management coming soon
          </div>
        )}

        {activeTab === 3 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--t3)" }}>
            <div style={{ fontSize: 13 }}>
              <Link href="/standup" style={{ color: "var(--navy)", fontWeight: 500 }}>Open Daily Standup →</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ val, label, color }: { val: string; label: string; color: string }) {
  return (
    <div style={{ background: "var(--surface)", borderRadius: 11, border: "1px solid var(--border)", padding: 14 }}>
      <div className="sv" style={{ color, marginBottom: 2 }}>{val}</div>
      <div className="sl">{label}</div>
    </div>
  );
}

function PersonCard({ person: p }: { person: PersonData }) {
  const s = SIGNAL_STYLES[p.signal];
  return (
    <div style={{
      background: "var(--surface)", borderRadius: 12,
      border: "1px solid var(--border)",
      borderLeft: `3px solid ${s.border}`,
      padding: 16, cursor: "pointer",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: p.avatarBg, color: p.avatarColor,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 600, flexShrink: 0,
        }}>
          {p.initials}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>{p.name}</div>
          <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 1 }}>{p.role}</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: "var(--t2)" }}>Workload signal</span>
        <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 8, background: s.badge, color: s.badgeColor }}>
          {p.signalLabel}
        </span>
      </div>

      <div style={{ height: 5, background: "var(--bg)", borderRadius: 4, overflow: "hidden", marginBottom: 10 }}>
        <div style={{ height: "100%", borderRadius: 4, width: `${p.pct}%`, background: s.bar }} />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
        {p.tags.map((t) => {
          const ts = TAG_STYLES[t.type];
          return (
            <span key={t.label} style={{ fontSize: 10, fontWeight: 500, padding: "2px 7px", borderRadius: 8, background: ts.bg, color: ts.color }}>
              {t.label}
            </span>
          );
        })}
      </div>

      <div style={{ background: "var(--bg)", borderRadius: 8, padding: 10, fontSize: 11, color: "var(--t2)", lineHeight: 1.5 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "var(--t3)", marginBottom: 3 }}>Today (from standup)</div>
        &ldquo;{p.standup}&rdquo;
        {p.flag && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6, fontSize: 10, color: "var(--red)", fontWeight: 500 }}>
            <div className="pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--red)", flexShrink: 0 }} />
            {p.flag}
          </div>
        )}
      </div>
    </div>
  );
}