import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EventDetail } from "@/components/events/event-detail";

export default async function EventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const supabase = await createClient();

  const [
    { data: event },
    { data: phases },
    { data: tasks },
    { data: people },
    { data: threads },
  ] = await Promise.all([
    supabase.from("events").select("*").eq("id", eventId).single(),
    supabase.from("phases").select("*").eq("event_id", eventId).order("order_index"),
    supabase.from("tasks")
      .select("*, owner:people(id, full_name, department)")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false }),
    supabase.from("people").select("id, full_name, department").order("full_name"),
    supabase.from("activity_threads")
      .select("*, owner:people(id, full_name, department), entries:thread_entries(id, content, created_at, ai_urgency, ai_escalate)")
      .eq("event_id", eventId)
      .order("last_entry_at", { ascending: false, nullsFirst: false }),
  ]);

  if (!event) notFound();

  return (
    <EventDetail
      event={event}
      phases={phases ?? []}
      tasks={tasks ?? []}
      people={people ?? []}
      threads={threads ?? []}
    />
  );
}