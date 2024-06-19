"use client";

import {
  Table,
  Modal,
  Button,
  Badge,
  Checkbox,
  Dropdown,
  Label,
  TextInput,
  Spinner,
  Textarea,
} from "flowbite-react";
import ActivityLog from "../../components/ActivityLog";
import ImageCardGrid from "../../components/ImageCardGrid";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getAllTasks } from "../../utils/api/tasks";
import { createActivity } from "../../utils/api/activities";
import Link from "next/link";
import { formatReadableDate, formatAbbreviatedDate } from "../../utils/strings";
import { createTask, uploadFiles } from "../../utils/api/tasks";
import { getAllUsers } from "../../utils/api/users";
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

const CreateTaskModal = () => {
  const { data: session } = useSession();
  const [openModal, setOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isComplete: false,
    dueDate: "",
    urgency: "",
    images: [],
  });
  const [availableUsers, setAvailableUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const userResponse = await getAllUsers({
        jwt: session?.accessToken,
        query: "",
      });
      console.log(userResponse.data);
      setAvailableUsers(userResponse.data);
    } catch (error) {
      console.error("Error fetching users:", error.response.data.error.message);
    }
  };

  useEffect(() => {
    if (session) fetchUsers();
  }, [session]);

  const handleUserSelect = (user) => {
    setFormData({ ...formData, assignedUser: user });
  };

  const handleChange = (e) => {
    const { name, type, checked, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: Array.from(files) }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : e.target.value,
      }));
    }
  };

  const handleImageUpload = async (taskId) => {
    if (formData.images.length) {
      await uploadFiles(
        session?.accessToken,
        formData.images,
        taskId,
        "documents"
      );
    }
  };

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
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
        query: "",
      };

      // Assuming createTask is a function that you have defined or imported
      const taskResponse = await createTask(apiParams);

      console.log(taskResponse.data);

      if (taskResponse.data && formData.images.length) {
        await handleImageUpload(taskResponse.data.data.id);
      }

      console.log("Task and files submitted successfully.");
      setFormData({
        title: "",
        description: "",
        isComplete: false,
        dueDate: "",
        urgency: "",
        images: [],
        assignedUser: null,
      }); // Reset form
      // setOpenModal(false); // Close the modal on successful submission
      setIsLoading(false);
    } catch (error) {
      console.error(
        "Error submitting form:",
        error.response.data.error.message
      );
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
              <div className="m-auto">
                <Spinner
                  aria-label="Extra large spinner example"
                  size="xl"
                  className="m-auto"
                />
              </div>
              <h3>Creating Your Task</h3>
            </div>
          </div>
        )}

        <Modal.Header>Create a Task</Modal.Header>
        <Modal.Body>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="title" value="Title" />
              </div>
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
              <div className="mb-2 block">
                <Label htmlFor="description" value="Description" />
              </div>
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
              <div className="mb-2 block">
                <Label htmlFor="dueDate" value="Due Date" />
              </div>
              <TextInput
                id="dueDate"
                name="dueDate"
                type="text"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="urgency" value="Urgency" />
              </div>
              <select
                id="urgency"
                name="urgency"
                defaultValue={formData.urgency || "low"}
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
              <div className="mb-2 block">
                <Label htmlFor="images" value="Upload Images" />
              </div>
              <input
                type="file"
                id="images"
                name="images"
                multiple
                onChange={handleChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-violet-50 file:text-violet-700
                  hover:file:bg-violet-100"
              />
            </div>
            <div className="mb-2 block">
              <Label value="Assign User" />
              <select
                id="urgency"
                name="urgency"
                defaultValue={formData.urgency || "low"}
                onChange={handleChange}
                className="form-select block w-full mt-1 rounded-md bg-gray-50 border-gray-300"
              >
                {availableUsers.map((user) => (
                  <option
                    key={user.id}
                    value={user.id}
                    onClick={() => handleUserSelect(user)}
                  >
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
            </div>
            {/* Submit button */}
            <Button type="submit">Submit</Button>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default function Page({ params }) {
  const { data: session } = useSession();
  const [openModal, setOpenModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);

  useEffect(() => {
    const query = qs.stringify({
      populate: {
        documents: {
          populate: "*",
        },
        assigned: {
          populate: "*",
        },
      },
    });

    const fetchTasks = async () => {
      if (!session) return;
      const response = await getAllTasks({
        jwt: session?.accessToken,
        query: query,
      });

      console.log(response.data.data);
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
    console.log("instide the activity loag");
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
      query: "",
    };
    const response = await createActivity(apiParams);

    console.log(response.data);

    return response.data.data;
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification("Permission Granted!");
      }
    }
  };

  const sendNotification = () => {
    if ("Notification" in window) {
      new Notification("You have a new task assigned!");
    }
  };

  const series = [44, 55, 13, 43, 22];

  const lineChartSeries = [
    {
      name: "Sample Data",
      data: [10, 41, 35, 51, 49, 62, 69, 91, 148],
    },
  ];

  const options = {
    chart: {
      type: "donut",
      height: "100%",
      width: "100%",
      parentHeightOffset: 0,
      offsetX: 18,
    },
    dataLabels: {
      enabled: false,
    },
    labels: [], // No labels
    legend: {
      show: false,
    },
    tooltip: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "0%",
        },
      },
    },

    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            show: false,
          },
        },
      },
    ],
  };

  const lineChartOptions = {
    chart: {
      height: "100%",
      width: "100%",
      parentHeightOffset: 0,
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
    },
    xaxis: {
      show: false,
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
      ],
      labels: {
        show: false,
      },

      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        show: false,
      },
    },
    grid: {
      show: false,
    },
    tooltip: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: "100%",
          },
          legend: {
            show: false,
          },
        },
      },
    ],
  };

  return (
    <div className="flex gap-4 flex-col justify-between py-6">
      <section className="flex justify-between items-center">
        <CreateTaskModal />
      </section>

      {/* <section className="bg-white p-6 rounded-lg">
        <div className="grid grid-cols-4 gap-3 w-full">
          <div className="flex bg-gray-50 gap-4 rounded-lg p-6">
            <div className="bg-gray-200 p-3 rounded-full">
              <p className="text-2xl text-gray-800">55</p>
            </div>
            <p className="self-center text-sm text-center text-gray-800 font-semibold mt-2">
              Total Tasks
            </p>
          </div>

          <div className="flex bg-yellow-50 gap-4 rounded-lg p-6">
            <div className="bg-yellow-100 p-3 rounded-full">
              <p className="text-2xl text-yellow-800">12</p>
            </div>
            <p className="self-center text-sm text-center text-yellow-800 font-semibold mt-2">
              Urgent Tasks
            </p>
          </div>

          <div className="flex bg-red-50 gap-4 rounded-lg p-6">
            <div className="bg-red-100 p-3 rounded-full">
              <p className="text-2xl text-red-800">18</p>
            </div>
            <p className="self-center text-sm text-center text-red-800 font-semibold mt-2">
              Not Opened
            </p>
          </div>

          <div className="flex bg-green-50 gap-4 rounded-lg p-6">
            <div className="bg-green-100 p-3 rounded-full">
              <p className="text-2xl text-green-600">3</p>
            </div>
            <p className="self-center text-sm text-center text-green-600 font-semibold mt-2">
              Late Tasks
            </p>
          </div>
        </div>
      </section> */}

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

      <section>
        <Modal show={openModal} onClose={() => setOpenModal(false)} size="7xl">
          <Modal.Header>Terms of Service</Modal.Header>
          <Modal.Body className="p-0">
            <section className="flex">
              <div className="w-full p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {selectedTask && selectedTask.attributes.title}
                </h2>
                <div className="max-h-24 h-24 overflow-auto mb-5">
                  <p className="text-gray-600 dark:text-gray-300">
                    {selectedTask && selectedTask.attributes.description}
                  </p>
                </div>
                <p className="text-gray-600 dark:text-gray-300 flex">
                  Urgency:{" "}
                  {selectedTask && (
                    <UrgencyBadge urgency={selectedTask.attributes.urgency} />
                  )}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Due Date: {selectedTask && selectedTask.attributes.dueDate}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Assigned By:{" "}
                  {selectedTask && selectedTask.attributes.assignedBy}
                </p>

                <div className=" mt-8">
                  <ImageCardGrid
                    files={
                      (selectedTask &&
                        selectedTask.attributes.documents?.data) ||
                      []
                    }
                    background={"bg-white"}
                    editMode={false}
                    columns={3}
                    padded={false}
                  />
                </div>
              </div>
              <div className="w-full p-6 bg-gray-100">
                <ActivityLog
                  id={selectedTask && selectedTask.id}
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
      </section>
    </div>
  );
}
