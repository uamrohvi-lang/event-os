import { createClient } from "@/lib/supabase/server";
import { EventsGrid } from "@/components/events/events-grid";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-6">
      <EventsGrid events={events ?? []} />
    </div>
  );
}
