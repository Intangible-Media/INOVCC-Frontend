import { fetchAllTasks, createTask, uploadFiles } from "../../utils/api/tasks";
import { getAllUsers } from "../../utils/api/users";
import { getServerSession } from "next-auth";
import NewTaskModal from "../../components/Modals/NewTaskModal";
import TasksTable from "../../components/Tables/TasksTable";
import { authOptions } from "../../app/api/auth/[...nextauth]/auth";
import { Card } from "flowbite-react";
import TaskCard from "../../components/TaskCard";
import { Badge } from "flowbite-react";
import LateTasksList from "../../components/LateTasksList";
import qs from "qs";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) return <p>You must be logged in to view this page.</p>;

  const usersWithOverdueTasksQuery = qs.stringify({
    filters: {
      tasks: {
        isComplete: {
          $ni: true, // Checks for tasks that are not complete
        },
        dueDate: {
          $lt: new Date().toISOString(), // Fetch tasks where dueDate is less than the current date
        },
      },
    },
    populate: {
      tasks: {
        filters: {
          isComplete: {
            $ni: true, // Include only tasks that are not complete
          },
          dueDate: {
            $lt: new Date().toISOString(), // Include only tasks that are overdue
          },
        },
        fields: ["isComplete", "title", "description", "dueDate", "urgency"], // Populate relevant fields
      },
      picture: { populate: "*" },
    },
  });

  const usersTasksQuery = qs.stringify({
    filters: {
      assigned: {
        id: {
          $eq: session.user.id,
        },
      },
    },
    populate: {
      documents: { populate: "*" },
    },
    sort: ["createdAt:desc"], // Sort by createdAt in descending order
  });

  const allTasksQuery = qs.stringify({
    populate: {
      documents: { populate: "*" },
      assigned: {
        populate: "picture",
      },
    },
    sort: ["createdAt:desc"], // Sort by createdAt in descending order
  });

  const userTasks = await fetchAllTasks({
    jwt: session.accessToken,
    query: usersTasksQuery,
  });

  const allTasks = await fetchAllTasks({
    jwt: session.accessToken,
    query: allTasksQuery,
  });

  console.log(allTasks.data);

  const allUsersWithLateTasks = await getAllUsers({
    jwt: session.accessToken,
    query: usersWithOverdueTasksQuery,
  });

  allUsersWithLateTasks.data.map((user) => console.log(user.tasks));

  return (
    <div className="flex gap-4 flex-col justify-between py-6">
      <section className="flex justify-between items-center">
        <NewTaskModal />
      </section>

      <section className="grid grid-cols-3 gap-3">
        <div className="col-span-2 bg-white rounded-md p-3 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
              All Tasks
              <Badge className="inline-block">{allTasks.data.length}</Badge>
            </h5>
            <a
              href="#"
              className="text-sm font-medium text-cyan-600 hover:underline dark:text-cyan-500"
            >
              View all
            </a>
          </div>
          <div className="h-72 overflow-auto">
            <TasksTable tasks={allTasks.data} />
          </div>
        </div>
        <div className="col-span-1 rounded-md bg-white p-3 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
              Late Tasks
            </h5>
            <a
              href="#"
              className="text-sm font-medium text-cyan-600 hover:underline dark:text-cyan-500"
            >
              View all
            </a>
          </div>
          <LateTasksList users={allUsersWithLateTasks.data} />
        </div>
      </section>

      <section className="bg-white p-6 rounded-lg">
        <h5 className="text-xl font-bold dark:text-white mb-3">
          My Tasks{" "}
          <Badge className="inline-block">{userTasks.data.length}</Badge>
        </h5>
        <div className="grid grid-cols-5 gap-3">
          {userTasks.data.map((task, index) => (
            <TaskCard task={task} key={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
