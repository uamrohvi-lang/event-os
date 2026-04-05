export default function BriefingPage() {
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Topbar */}
      <div style={{
        height: 54, background: "var(--surface)", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", padding: "0 24px", flexShrink: 0,
      }}>
        <span style={{ fontSize: 15, fontWeight: 600 }}>PM Morning Briefing</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <button className="btn btn-out btn-sm">Mark all read</button>
          <div className="av">SR</div>
        </div>
      </div>

      <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
        {/* Header card */}
        <div style={{
          background: "var(--navy)", borderRadius: 14, padding: 24, marginBottom: 20, color: "#fff",
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
            {today}
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.4, marginBottom: 4 }}>
            Your morning briefing
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
            AI-generated from overnight activity · 8 items need your attention
          </div>
          <div style={{ display: "flex", gap: 24, marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            {[
              { val: "3", label: "Critical alerts", color: "#F09595" },
              { val: "5", label: "Need attention",  color: "#FAC775" },
              { val: "9", label: "Standups logged", color: "#9FE1CB" },
              { val: "18", label: "Days to event",  color: "#fff" },
            ].map(({ val, label, color }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 600, fontVariantNumeric: "tabular-nums", color }}>{val}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical alerts */}
        <div style={{ marginBottom: 20 }}>
          <div className="section-label">Critical — requires your action today</div>
          <AlertCard
            color="red"
            icon="🔴"
            title="StageCo — vendor silent 4 days · Critical path at risk"
            body="Sara has attempted contact 3 times. Rigging specification overdue. Main Stage build cannot begin without it. 18 days to event."
            action="→ Contact Marc De Backer (senior escalation) · +32 475 123456"
            badge="Critical"
          />
          <AlertCard
            color="red"
            icon="🔴"
            title="G4S Security — contract unsigned · 18 days to event"
            body="Security services contract has not been signed despite verbal confirmation. Legal risk if not resolved this week."
            action="→ Chase legal team + G4S account manager"
            badge="Critical"
          />
          <AlertCard
            color="red"
            icon="⚠️"
            title="Sara Reeves — workload overloaded · 2 threads blocked"
            body="8 open threads, 2 blocked, 1 vendor silent 4 days. Consider redistributing the broadcast compound power thread to Dan Kim."
            action="→ Review Sara's threads and redistribute"
            badge="Overloaded"
          />
        </div>

        {/* Standups */}
        <div>
          <div className="section-label">Standups logged this morning</div>
          {[
            {
              initials: "TM", bg: "#E6F1FB", color: "#0C447C",
              name: "Tom Mackenzie",
              text: "Working through speaker transfer schedule. Should have draft to Lena by EOD. Freight customs still outstanding.",
              flag: "Blocked: customs clearance still pending",
            },
            {
              initials: "LO", bg: "#E1F5EE", color: "#085041",
              name: "Lena Obi",
              text: "Confirmed 14 of 18 speakers on travel. Still pending: keynote slot 2 (visa issue), two remote panellists TBC.",
            },
            {
              initials: "DK", bg: "#EEEDFE", color: "#3C3489",
              name: "Dan Kim",
              text: "Floorplan v4 approved. Waiting on electrical load sheet from venue. Relatively free this afternoon — can take additional work.",
            },
          ].map((s) => (
            <div key={s.name} style={{
              background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)",
              padding: "12px 14px", marginBottom: 6,
              display: "flex", alignItems: "flex-start", gap: 10,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: s.bg, color: s.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 600, flexShrink: 0,
              }}>{s.initials}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--t1)", marginBottom: 2 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: "var(--t2)", lineHeight: 1.4 }}>&ldquo;{s.text}&rdquo;</div>
                {s.flag && (
                  <div style={{ fontSize: 10, color: "var(--red)", fontWeight: 600, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                    ⚠ {s.flag}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div style={{ background: "var(--bg)", borderRadius: 9, padding: "10px 14px", fontSize: 12, color: "var(--t3)", border: "1px solid var(--border)" }}>
            + 6 more standups logged · 3 not yet submitted
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertCard({ color, icon, title, body, action, badge }: {
  color: "red" | "amber" | "info";
  icon: string;
  title: string;
  body: string;
  action: string;
  badge: string;
}) {
  const borderColor = color === "red" ? "var(--red)" : color === "amber" ? "var(--amber)" : "var(--blue)";
  return (
    <div style={{
      background: "var(--surface)", borderRadius: 11, border: "1px solid var(--border)",
      padding: "14px 16px", marginBottom: 8,
      display: "flex", gap: 12, alignItems: "flex-start",
      borderLeft: `3px solid ${borderColor}`,
    }}>
      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.5 }}>{body}</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--navy)", marginTop: 6, cursor: "pointer" }}>{action}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
        <span className="badge badge-red">{badge}</span>
        <span style={{ fontSize: 10, color: "var(--t3)" }}>AI detected</span>
      </div>
    </div>
  );
}