"use client";

import {
  Table,
  Modal,
  Button,
  Badge,
  Label,
  TextInput,
  Spinner,
  Textarea,
} from "flowbite-react";
import ActivityLog from "../../components/ActivityLog";
import ImageCardGrid from "../../components/ImageCardGrid";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getAllTasks, createTask, uploadFiles } from "../../utils/api/tasks";
import { createActivity } from "../../utils/api/activities";
import { getAllUsers } from "../../utils/api/users";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import qs from "qs";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const UrgencyBadge = ({ urgency }) => {
  const urgencyMap = {
    low: { color: "success", text: "Low" },
    medium: { color: "warning", text: "Medium" },
    high: { color: "danger", text: "High" },
    default: { color: "failure", text: "Failure" },
  };

  const { color, text } =
    urgencyMap[urgency.toLowerCase()] || urgencyMap.default;

  return (
    <div className="flex justify-center">
      <Badge color={color} className="text-center" size="sm">
        {text}
      </Badge>
    </div>
  );
};

const formatAbbreviatedDate = (dateString) => {
  const date = new Date(dateString);
  const month = date.toLocaleString("default", { month: "short" });
  const day = date.getDate();
  return { month, day };
};

const CreateTaskModal = () => {
  const { data: session } = useSession();
  const [openModal, setOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isComplete: false,
    dueDate: "",
    urgency: "low",
    images: [],
    assignedUser: null,
  });
  const [availableUsers, setAvailableUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const userResponse = await getAllUsers({ jwt: session?.accessToken });
      setAvailableUsers(userResponse.data);
    } catch (error) {
      console.error("Error fetching users:", error.response.data.error.message);
    }
  };

  useEffect(() => {
    if (session) fetchUsers();
  }, [session]);

  const handleChange = (e) => {
    const { name, type, value, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "file"
          ? Array.from(files)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiParams = {
        jwt: session?.accessToken,
        payload: {
          data: {
            title: formData.title,
            description: formData.description,
            isComplete: formData.isComplete,
            urgency: formData.urgency.toLowerCase(),
            assigned: formData.assignedUser?.id,
          },
        },
      };

      const taskResponse = await createTask(apiParams);
      if (taskResponse.data && formData.images.length) {
        await uploadFiles(
          session?.accessToken,
          formData.images,
          taskResponse.data.data.id,
          "documents"
        );
      }

      setFormData({
        title: "",
        description: "",
        isComplete: false,
        dueDate: "",
        urgency: "low",
        images: [],
        assignedUser: null,
      });
      setOpenModal(false);
    } catch (error) {
      console.error(
        "Error submitting form:",
        error.response.data.error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpenModal(true)}
        className="bg-dark-blue-700 text-white w-full"
      >
        Add Task
      </Button>
      <Modal
        show={openModal}
        onClose={() => setOpenModal(false)}
        className="relative"
      >
        {isLoading && (
          <div className="flex justify-center absolute top-0 left-0 right-0 bottom-0 bg-white z-50 rounded-lg">
            <div className="flex flex-col gap-3 justify-center m-auto">
              <Spinner aria-label="Loading" size="xl" className="m-auto" />
              <h3>Creating Your Task</h3>
            </div>
          </div>
        )}

        <Modal.Header>Create a Task</Modal.Header>
        <Modal.Body>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="title" value="Title" className="mb-2 block" />
              <TextInput
                id="title"
                name="title"
                type="text"
                placeholder="Enter title"
                value={formData.title}
                onChange={handleChange}
                required
                shadow
              />
            </div>
            <div>
              <Label
                htmlFor="description"
                value="Description"
                className="mb-2 block"
              />
              <Textarea
                id="description"
                name="description"
                placeholder="Enter description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label
                htmlFor="dueDate"
                value="Due Date"
                className="mb-2 block"
              />
              <TextInput
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="urgency" value="Urgency" className="mb-2 block" />
              <select
                id="urgency"
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                className="form-select block w-full mt-1 rounded-md bg-gray-50 border-gray-300"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <Label
                htmlFor="images"
                value="Upload Images"
                className="mb-2 block"
              />
              <input
                type="file"
                id="images"
                name="images"
                multiple
                onChange={handleChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
              />
            </div>
            <div className="mb-2 block">
              <Label value="Assign User" />
              <select
                id="assignedUser"
                name="assignedUser"
                value={formData.assignedUser?.id || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    assignedUser: availableUsers.find(
                      (user) => user.id === e.target.value
                    ),
                  }))
                }
                className="form-select block w-full mt-1 rounded-md bg-gray-50 border-gray-300"
              >
                <option value="" disabled>
                  Select User
                </option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit">Submit</Button>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

const Page = ({ params }) => {
  const { data: session } = useSession();
  const [openModal, setOpenModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);

  useEffect(() => {
    const query = qs.stringify({
      populate: {
        documents: { populate: "*" },
        assigned: { populate: "*" },
      },
    });

    const fetchTasks = async () => {
      if (!session) return;
      const response = await getAllTasks({ jwt: session?.accessToken, query });
      setTasks(response.data.data);
    };

    fetchTasks();
  }, [session]);

  useEffect(() => {
    setMyTasks(
      tasks.filter(
        (task) => task.attributes.assigned.data.id === session?.user.id
      )
    );
  }, [tasks]);

  const createActivityLog = async ({ taskId }) => {
    const apiParams = {
      jwt: session?.accessToken,
      payload: {
        data: {
          collection: "tasks",
          collectionId: taskId,
          action: "Created",
          message: `${session?.user.email} has viewed this task`,
          user: session?.user.id,
        },
      },
    };
    await createActivity(apiParams);
  };

  return (
    <div className="flex gap-4 flex-col justify-between py-6">
      <section className="flex justify-between items-center">
        <CreateTaskModal />
      </section>

      <section className="overflow-x-auto bg-white p-6 rounded-lg">
        <h5 className="text-xl font-bold dark:text-white mb-3">My Tasks</h5>
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Task Name</Table.HeadCell>
            <Table.HeadCell>Task Description</Table.HeadCell>
            <Table.HeadCell>Urgency</Table.HeadCell>
            <Table.HeadCell>Due Date</Table.HeadCell>
            <Table.HeadCell>Completed</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {myTasks.map((task, index) => (
              <Table.Row
                key={index}
                className="bg-white dark:border-gray-700 dark:bg-gray-800"
                onClick={() => {
                  setOpenModal(true);
                  setSelectedTask(task);
                  createActivityLog({ taskId: task.id });
                }}
              >
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                  {task.attributes.title}
                </Table.Cell>
                <Table.Cell className="font-medium text-gray-900 dark:text-white">
                  {task.attributes.description.slice(0, 30) + "..."}
                </Table.Cell>
                <Table.Cell>
                  <UrgencyBadge urgency={task.attributes.urgency} />
                </Table.Cell>
                <Table.Cell>
                  {`${formatAbbreviatedDate(task.attributes.dueDate).month} ${
                    formatAbbreviatedDate(task.attributes.dueDate).day
                  }`}
                </Table.Cell>
                <Table.Cell>{task.attributes.isComplete}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </section>

      <section className="overflow-x-auto bg-white p-6 rounded-lg">
        <h5 className="text-xl font-bold dark:text-white mb-3">All Tasks</h5>
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Task Name</Table.HeadCell>
            <Table.HeadCell>Task Description</Table.HeadCell>
            <Table.HeadCell>Urgency</Table.HeadCell>
            <Table.HeadCell>Due Date</Table.HeadCell>
            <Table.HeadCell>Completed</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {tasks.map((task, index) => (
              <Table.Row
                key={index}
                className="bg-white dark:border-gray-700 dark:bg-gray-800"
                onClick={() => {
                  setOpenModal(true);
                  setSelectedTask(task);
                  createActivityLog({ taskId: task.id });
                }}
              >
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                  {task.attributes.title}
                </Table.Cell>
                <Table.Cell className="font-medium text-gray-900 dark:text-white">
                  {task.attributes.description.slice(0, 30) + "..."}
                </Table.Cell>
                <Table.Cell>
                  <UrgencyBadge urgency={task.attributes.urgency} />
                </Table.Cell>
                <Table.Cell>
                  {`${formatAbbreviatedDate(task.attributes.dueDate).month} ${
                    formatAbbreviatedDate(task.attributes.dueDate).day
                  }`}
                </Table.Cell>
                <Table.Cell>{task.attributes.isComplete}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </section>

      {selectedTask && (
        <Modal show={openModal} onClose={() => setOpenModal(false)} size="7xl">
          <Modal.Header>Task Details</Modal.Header>
          <Modal.Body className="p-0">
            <section className="flex">
              <div className="w-full p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {selectedTask.attributes.title}
                </h2>
                <div className="max-h-24 h-24 overflow-auto mb-5">
                  <p className="text-gray-600 dark:text-gray-300">
                    {selectedTask.attributes.description}
                  </p>
                </div>
                <p className="text-gray-600 dark:text-gray-300 flex">
                  Urgency:{" "}
                  <UrgencyBadge urgency={selectedTask.attributes.urgency} />
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Due Date: {selectedTask.attributes.dueDate}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Assigned By: {selectedTask.attributes.assignedBy}
                </p>
                <div className="mt-8">
                  <ImageCardGrid
                    files={selectedTask.attributes.documents?.data || []}
                    background={"bg-white"}
                    editMode={false}
                    columns={3}
                    padded={false}
                  />
                </div>
              </div>
              <div className="w-full p-6 bg-gray-100">
                <ActivityLog
                  id={selectedTask.id}
                  collection="tasks"
                  defaultExpanded={true}
                />
              </div>
            </section>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => requestNotificationPermission()}>
              Mark Complete
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default Page;
