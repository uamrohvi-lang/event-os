import { createClient } from "@/lib/supabase/server";
import { StandupView } from "@/components/standup/standup-view";

export default async function StandupPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: entries } = await supabase
    .from("standup_entries")
    .select("*, person:people(id, full_name, department)")
    .eq("entry_date", today)
    .order("created_at", { ascending: false });

  const { data: { user } } = await supabase.auth.getUser();
  const { data: myPerson } = await supabase
    .from("people")
    .select("id, full_name")
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  const { data: profile } = await supabase
    .from("users")
    .select("full_name")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  return (
    <StandupView
      entries={entries ?? []}
      myPersonId={myPerson?.id ?? null}
      today={today}
      userName={myPerson?.full_name ?? profile?.full_name ?? undefined}
    />
  );
}