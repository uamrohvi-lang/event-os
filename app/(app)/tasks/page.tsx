import { createClient } from "@/lib/supabase/server";
import { TasksView } from "@/components/tasks/tasks-view";

export default async function TasksPage() {
  const supabase = await createClient();

  const { data: tasks } = await supabase
    .from("tasks")
    .select(`
      *,
      owner:people(id, full_name, department),
      event:events(id, name)
    `)
    .order("due_date", { ascending: true, nullsFirst: false });

  return (
    <div className="p-6">
      <TasksView tasks={tasks ?? []} />
    </div>
  );
}
