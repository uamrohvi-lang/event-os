import { createClient } from "@/lib/supabase/server";
import { StandupView } from "@/components/standup/standup-view";

export default async function StandupPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: entries } = await supabase
    .from("standup_entries")
    .select(`
      *,
      person:people(id, full_name, department)
    `)
    .eq("entry_date", today)
    .order("created_at", { ascending: false });

  // Check if current user's person has submitted
  const { data: { user } } = await supabase.auth.getUser();
  const { data: myPerson } = await supabase
    .from("people")
    .select("id, full_name")
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  return (
    <div className="p-6">
      <StandupView
        entries={entries ?? []}
        myPersonId={myPerson?.id ?? null}
        today={today}
      />
    </div>
  );
}
