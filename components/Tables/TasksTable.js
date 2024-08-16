"use client";
import {
  Table,
  Modal,
  Button,
  Badge,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableHeadCell,
} from "flowbite-react";
import ActivityLog from "../../components/ActivityLog";
import ImageCardGrid from "../../components/ImageCardGrid";
import { useSession } from "next-auth/react";
import { createActivity } from "../../utils/api/activities";
import { useState } from "react";

const UrgencyBadge = ({ urgency }) => {
  const urgencyMap = {
    low: { color: "success", text: "Low" },
    medium: { color: "warning", text: "Medium" },
    high: { color: "failure", text: "High" },
    default: { color: "failure", text: "Failure" },
  };

  const { color, text } =
    urgencyMap[urgency.toLowerCase()] || urgencyMap.default;

  return (
    <span className="flex justify-start">
      <Badge color={color} className="text-center" size="sm">
        {text}
      </Badge>
    </span>
  );
};

export default function TasksTable({ tasks }) {
  const { data: session } = useSession();
  const [selectedTask, setSelectedTask] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const handleSelectedTask = (task) => {
    setSelectedTask(task);
    setOpenModal(true);
    createActivityLog(task.id);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: "short", day: "numeric", year: "numeric" };
    return date.toLocaleDateString("en-US", options).replace(",", "");
  };

  const daysUntilDue = (dueDateString) => {
    const dueDate = new Date(dueDateString);
    const currentDate = new Date();

    // Calculate the difference in time (milliseconds)
    const timeDifference = dueDate.getTime() - currentDate.getTime();

    // Convert time difference from milliseconds to days
    const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

    // Handle cases where the due date is today, in the past, or in the future
    if (daysDifference > 0) {
      return `${daysDifference} day${daysDifference > 1 ? "s" : ""} left`;
    } else if (daysDifference === 0) {
      return "Due today";
    } else {
      return `Overdue by ${Math.abs(daysDifference)} day${
        Math.abs(daysDifference) > 1 ? "s" : ""
      }`;
    }
  };

  const daysAgo = (dateString) => {
    const givenDate = new Date(dateString);
    const currentDate = new Date();

    // Calculate the difference in time (milliseconds)
    const timeDifference = currentDate.getTime() - givenDate.getTime();

    // Convert time difference from milliseconds to days
    const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));

    // Handle cases where the date is today or in the past
    if (daysDifference === 0) {
      return "Today";
    } else if (daysDifference > 0) {
      return `${daysDifference} day${daysDifference > 1 ? "s" : ""} ago`;
    } else {
      return "Invalid date"; // This case handles future dates, if any, are mistakenly passed in
    }
  };

  const isLate = (dueDateString) => {
    const dueDate = new Date(dueDateString);
    const currentDate = new Date();

    return dueDate < currentDate;
  };

  const createActivityLog = async (taskId) => {
    if (!session) return;
    const apiParams = {
      jwt: session.accessToken,
      payload: {
        data: {
          collection: "tasks",
          collectionId: taskId,
          action: "Created",
          message: `${session.user.email} has viewed this task`,
          user: session.user.id,
        },
      },
    };
    await createActivity(apiParams);
  };

  return (
    <>
      {selectedTask && (
        <Modal show={openModal} onClose={() => setOpenModal(false)} size="7xl">
          <Modal.Header>Task Details</Modal.Header>
          <Modal.Body className="p-0">
            <section className="flex">
              <div className="w-full p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 capitalize">
                  {selectedTask.attributes.title}
                </h2>
                <div className="max-h-24 h-24 overflow-auto mb-5">
                  <p className="text-gray-600 dark:text-gray-300">
                    {selectedTask.attributes.description}
                  </p>
                </div>
                <p className="text-gray-600 dark:text-gray-300 flex justify-start">
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
            <Button>Mark Complete</Button>
          </Modal.Footer>
        </Modal>
      )}
      <Table hoverable>
        <TableHead>
          <TableHeadCell>Task Name</TableHeadCell>
          <TableHeadCell>Task Description</TableHeadCell>
          <TableHeadCell>Urgency</TableHeadCell>
          <TableHeadCell>Due Date</TableHeadCell>
          <TableHeadCell>Created</TableHeadCell>
          <TableHeadCell>Status</TableHeadCell>
        </TableHead>
        <TableBody className="divide-y">
          {tasks.map((task, index) => (
            <TableRow
              key={index}
              className={`bg-white dark:border-gray-700 dark:bg-gray-800 cursor-pointer ${
                !task.attributes.isComplete && isLate(task.attributes.dueDate)
                  ? "bg-red-50"
                  : ""
              }`}
              onClick={() => handleSelectedTask(task)}
            >
              <TableCell className=" font-medium  dark:text-white shorten-text w-20 text-dark-blue-700 capitalize">
                {task.attributes.title}
              </TableCell>
              <TableCell className=" font-normal text-gray-900 dark:text-white shorten-text min-w-48 max-w-48">
                {task.attributes.description}
              </TableCell>
              <TableCell className=" w-36">
                <UrgencyBadge urgency={task.attributes.urgency} />
              </TableCell>
              <TableCell className="font-medium text-gray-800">
                {`${formatDate(task.attributes.dueDate)}`}
                <span className="font-normal text-gray-400 capitalize">
                  {`  (${daysUntilDue(task.attributes.dueDate)})`}
                </span>
              </TableCell>
              <TableCell className="font-medium text-gray-800">
                {`${daysAgo(task.attributes.createdAt)}`}
              </TableCell>
              <TableCell
                className={
                  task.attributes.isComplete
                    ? "bg-green-200 text-green-800 font-medium text-center leading-none"
                    : isLate(task.attributes.dueDate)
                    ? "bg-red-200 text-red-800 font-medium text-center leading-none"
                    : "bg-yellow-100 text-yellow-800 font-medium text-center leading-none"
                }
              >
                {task.attributes.isComplete
                  ? "Completed"
                  : isLate(task.attributes.dueDate)
                  ? "Late"
                  : "Open"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
