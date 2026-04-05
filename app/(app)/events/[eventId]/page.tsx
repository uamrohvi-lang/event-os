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

  const [{ data: event }, { data: phases }, { data: tasks }] = await Promise.all([
    supabase.from("events").select("*").eq("id", eventId).single(),
    supabase.from("phases").select("*").eq("event_id", eventId).order("order_index"),
    supabase.from("tasks").select("*").eq("event_id", eventId).order("created_at", { ascending: false }),
  ]);

  if (!event) notFound();

  return <EventDetail event={event} phases={phases ?? []} tasks={tasks ?? []} />;
}
