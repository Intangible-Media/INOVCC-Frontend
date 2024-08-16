import { getAllTasks, createTask, uploadFiles } from "../../utils/api/tasks";
import { getServerSession } from "next-auth";
import NewTaskModal from "../../components/Modals/NewTaskModal";
import TasksTable from "../../components/Tables/TasksTable";
import { authOptions } from "../../app/api/auth/[...nextauth]/auth";
import qs from "qs";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) return <p>You must be logged in to view this page.</p>;

  const query = qs.stringify({
    populate: {
      documents: { populate: "*" },
      assigned: { populate: "*" },
    },
  });

  const tasks = await getAllTasks({
    jwt: session.accessToken,
    query: query,
  });

  return (
    <div className="flex gap-4 flex-col justify-between py-6">
      <section className="flex justify-between items-center">
        <NewTaskModal />
      </section>

      <section className="overflow-x-auto bg-white p-6 rounded-lg">
        <h5 className="text-xl font-bold dark:text-white mb-3">My Tasks</h5>
        <TasksTable tasks={tasks.data.data} />
      </section>
    </div>
  );
}
