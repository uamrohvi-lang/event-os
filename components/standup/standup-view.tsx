"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
  userName?: string;
}

const AV_COLORS = [
  { bg: "#FAECE7", color: "#712B13" },
  { bg: "#E6F1FB", color: "#0C447C" },
  { bg: "#E1F5EE", color: "#085041" },
  { bg: "#EEEDFE", color: "#3C3489" },
  { bg: "#FAEEDA", color: "#633806" },
];

function getAv(name: string) {
  return AV_COLORS[name.charCodeAt(0) % AV_COLORS.length];
}
function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export function StandupView({ entries, myPersonId, today, userName }: StandupViewProps) {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0=not started, 1=q1, 2=q2, 3=q3, 4=done
  const [yesterday, setYesterday] = useState("");
  const [todayText, setTodayText] = useState("");
  const [blocked, setBlocked] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const myEntry = entries.find((e) => e.person_id === myPersonId);
  const hasSubmitted = !!myEntry;

  const formattedDate = new Date(today + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  async function handleSubmit() {
    if (!myPersonId) return;
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from("users").select("organisation_id").eq("id", user?.id ?? "").single();
    const { data: events } = await supabase.from("events").select("id").eq("organisation_id", profile?.organisation_id ?? "").limit(1);

    if (!events?.[0]) { setError("No event found"); setSubmitting(false); return; }

    const { error: err } = await supabase.from("standup_entries").upsert({
      event_id: events[0].id,
      person_id: myPersonId,
      entry_date: today,
      yesterday_text: yesterday || null,
      today_text: todayText || null,
      blocked_text: blocked || null,
    }, { onConflict: "event_id,person_id,entry_date" });

    if (err) { setError(err.message); setSubmitting(false); return; }
    setStep(4);
    router.refresh();
  }

  const prevEntry = entries.find((e) => e.person_id === myPersonId);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Topbar */}
      <div style={{
        height: 54, background: "var(--surface)", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", padding: "0 24px", flexShrink: 0,
      }}>
        <span style={{ fontSize: 15, fontWeight: 600 }}>Daily Standup</span>
        <div style={{ marginLeft: "auto" }}>
          <div className="av">{userName ? getInitials(userName) : "SR"}</div>
        </div>
      </div>

      <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 32, paddingTop: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              {formattedDate}
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.5, color: "var(--t1)", marginBottom: 6 }}>
              {step === 4 || hasSubmitted ? "Standup submitted ✓" : `Good morning${userName ? `, ${userName.split(" ")[0]}` : ""} 👋`}
            </h1>
            <p style={{ fontSize: 14, color: "var(--t3)" }}>
              {step === 4 || hasSubmitted ? "Your standup has been logged for today" : "Daily standup — takes about 60 seconds"}
            </p>
          </div>

          {/* Progress dots */}
          {step > 0 && step < 4 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 28 }}>
              {[1, 2, 3].map((s) => (
                <div key={s} style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: s < step ? "var(--teal)" : s === step ? "var(--navy)" : "var(--border)",
                }} />
              ))}
            </div>
          )}

          {/* Not started */}
          {step === 0 && !hasSubmitted && (
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <button className="btn btn-primary" style={{ padding: "12px 32px", fontSize: 15 }} onClick={() => setStep(1)}>
                Start standup →
              </button>
            </div>
          )}

          {/* Q1 */}
          {step === 1 && (
            <div style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)", padding: 28, marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--teal)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                Question 1 of 3
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "var(--t1)", letterSpacing: -0.3, marginBottom: 16 }}>
                What did you move forward yesterday?
              </div>
              <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 12, fontStyle: "italic" }}>
                Briefly — completed tasks, calls made, decisions reached
              </div>
              <textarea
                value={yesterday}
                onChange={(e) => setYesterday(e.target.value)}
                placeholder="e.g. Confirmed AV supplier, completed venue walkthrough, sent catering brief…"
                style={{ minHeight: 80, resize: "vertical" }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                <button className="btn btn-primary" onClick={() => setStep(2)}>Next →</button>
              </div>
            </div>
          )}

          {/* Q2 */}
          {step === 2 && (
            <div style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)", padding: 28, marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--teal)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                Question 2 of 3
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "var(--t1)", letterSpacing: -0.3, marginBottom: 16 }}>
                What are you focused on today?
              </div>
              <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 12, fontStyle: "italic" }}>
                Be specific — this feeds the PM workload view
              </div>
              <textarea
                value={todayText}
                onChange={(e) => setTodayText(e.target.value)}
                placeholder="e.g. Finalising the speaker transfer schedule, chasing freight forwarder on customs clearance…"
                style={{ minHeight: 80, resize: "vertical" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
                <button className="btn btn-out" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary" onClick={() => setStep(3)}>Next →</button>
              </div>
            </div>
          )}

          {/* Q3 */}
          {step === 3 && (
            <div style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)", padding: 28, marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--teal)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                Question 3 of 3
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "var(--t1)", letterSpacing: -0.3, marginBottom: 16 }}>
                Is anything blocked or at risk?
              </div>
              <textarea
                value={blocked}
                onChange={(e) => setBlocked(e.target.value)}
                placeholder="Optional — flag if something is stuck or you need help"
                style={{ minHeight: 60, resize: "vertical" }}
              />
              {error && <p style={{ color: "var(--red)", fontSize: 13, marginTop: 8 }}>{error}</p>}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                <button
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                    cursor: "pointer", background: "var(--red-l)", color: "var(--red)", border: "none",
                    fontFamily: "var(--font)",
                  }}
                >
                  🚨 Flag urgent issue
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11, color: "var(--t3)" }}>
                    {(yesterday + todayText + blocked).length} / 500
                  </span>
                  <button
                    className="btn btn-primary"
                    style={{ padding: "10px 24px", fontSize: 14, fontWeight: 600, borderRadius: 10 }}
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? "Submitting…" : "Submit standup →"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Previous standup reference */}
          {prevEntry && step > 0 && step < 4 && (
            <>
              <div style={{ height: 1, background: "var(--border)", margin: "24px 0" }} />
              <div className="section-label">Your last standup</div>
              <div style={{ background: "var(--bg)", borderRadius: 11, padding: 14, border: "1px solid var(--border)" }}>
                {prevEntry.yesterday_text && (
                  <>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "var(--t3)", marginBottom: 2 }}>Yesterday I moved forward</div>
                    <div style={{ fontSize: 12, color: "var(--t2)", marginBottom: 8, lineHeight: 1.4 }}>&ldquo;{prevEntry.yesterday_text}&rdquo;</div>
                  </>
                )}
                {prevEntry.today_text && (
                  <>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "var(--t3)", marginBottom: 2 }}>Today I was focused on</div>
                    <div style={{ fontSize: 12, color: "var(--t2)", marginBottom: 8, lineHeight: 1.4 }}>&ldquo;{prevEntry.today_text}&rdquo;</div>
                  </>
                )}
                {prevEntry.blocked_text && (
                  <>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "var(--t3)", marginBottom: 2 }}>Blocked</div>
                    <div style={{ fontSize: 12, color: "var(--amber)", lineHeight: 1.4 }}>&ldquo;{prevEntry.blocked_text}&rdquo;</div>
                  </>
                )}
              </div>
            </>
          )}

          {/* All standups (for PM view) */}
          {(step === 0 || step === 4 || hasSubmitted) && entries.length > 0 && (
            <>
              <div style={{ height: 1, background: "var(--border)", margin: "24px 0" }} />
              <div className="section-label">Standups logged today</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {entries.map((entry) => {
                  const av = getAv(entry.person?.full_name ?? "X");
                  return (
                    <div key={entry.id} style={{
                      background: "var(--surface)", borderRadius: 10,
                      border: "1px solid var(--border)", padding: "12px 14px",
                      display: "flex", alignItems: "flex-start", gap: 10,
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: av.bg, color: av.color,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 600, flexShrink: 0,
                      }}>
                        {getInitials(entry.person?.full_name ?? "?")}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--t1)", marginBottom: 2 }}>
                          {entry.person?.full_name ?? "Unknown"}
                        </div>
                        {entry.today_text && (
                          <div style={{ fontSize: 11, color: "var(--t2)", lineHeight: 1.4 }}>&ldquo;{entry.today_text}&rdquo;</div>
                        )}
                        {entry.blocked_text && (
                          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, fontSize: 10, color: "var(--red)", fontWeight: 600 }}>
                            ⚠ Blocked: {entry.blocked_text}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}