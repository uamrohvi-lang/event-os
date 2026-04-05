import { createClient } from "@/lib/supabase/server";
import { ThreadsView } from "@/components/threads/threads-view";

export default async function ThreadsPage() {
  const supabase = await createClient();

  const { data: threads } = await supabase
    .from("activity_threads")
    .select(`
      *,
      owner:people(id, full_name, department),
      entries:thread_entries(id, content, created_at, ai_urgency, ai_escalate)
    `)
    .order("last_entry_at", { ascending: false, nullsFirst: false });

  return (
    <div className="p-6">
      <ThreadsView threads={threads ?? []} />
    </div>
  );
}
