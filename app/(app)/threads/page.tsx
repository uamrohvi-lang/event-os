import { createClient } from "@/lib/supabase/server";
import { ThreadsView } from "@/components/threads/threads-view";

export default async function ThreadsPage() {
  const supabase = await createClient();

  const [{ data: threads }, { data: people }] = await Promise.all([
    supabase
      .from("activity_threads")
      .select("*, owner:people(id, full_name, department), entries:thread_entries(id, content, created_at, ai_urgency, ai_escalate)")
      .order("last_entry_at", { ascending: false, nullsFirst: false }),
    supabase.from("people").select("id, full_name, department").order("full_name"),
  ]);

  return (
    <ThreadsView threads={threads ?? []} people={people ?? []} />
  );
}