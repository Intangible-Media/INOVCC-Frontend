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
import { useTaskContext } from "../../context/TaskContext";
import { useSession } from "next-auth/react";
import { updateTask } from "../../utils/api/tasks";
import { createActivity } from "../../utils/api/activities";
import { refreshTaskData } from "../../app/actions"; // Import revalidatePath
import AvatarImage from "../AvatarImage";
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
    <div className=" justify-start w-14">
      <Badge color={color} className="text-center inline-block" size="xs">
        {text}
      </Badge>
    </div>
  );
};

export default function TasksTable({ tasks }) {
  const { data: session } = useSession();
  const { setSelectedTask, setOpenModal } = useTaskContext();

  const handleSelectedTask = (task) => {
    setSelectedTask(task);
    setOpenModal(true);
    createActivityLog(task.id);
  };

  const markTaskAsComplete = async (task) => {
    const apiParams = {
      jwt: session.accessToken,
      id: task.id,
      payload: {
        data: {
          isComplete: true,
        },
      },
    };

    const updatedTask = await updateTask(apiParams);
    setSelectedTask(updatedTask.data.data);

    refreshTaskData();
  };

  const markTaskAsIncomplete = async (task) => {
    const apiParams = {
      jwt: session.accessToken,
      id: task.id,
      payload: {
        data: {
          isComplete: false,
        },
      },
    };

    const updatedTask = await updateTask(apiParams);
    setSelectedTask(updatedTask.data.data);

    refreshTaskData();
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

  const statusBackground = (task) => {
    if (task.attributes.isComplete) {
      return "bg-green-200 text-green-800 font-medium text-center leading-none";
    }

    if (isLate(task.attributes.dueDate)) {
      return "bg-red-200 text-red-800 font-medium text-center leading-none";
    } else {
      return "bg-yellow-100 text-yellow-800 font-medium text-center leading-none";
    }
  };

  return (
    <Table hoverable>
      <TableHead>
        <TableHeadCell>Task</TableHeadCell>
        <TableHeadCell>Urgency</TableHeadCell>
        <TableHeadCell>Due Date</TableHeadCell>
        <TableHeadCell>Assigned</TableHeadCell>
        <TableHeadCell className="text-center">Status</TableHeadCell>
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
              <p className="w-24">{task.attributes.title}</p>
            </TableCell>

            <TableCell className="w-32">
              <UrgencyBadge urgency={task.attributes.urgency} />
            </TableCell>
            <TableCell className="font-medium text-gray-800">
              <p className="w-42">
                {`${formatDate(task.attributes.dueDate)}`}
                <span className="font-normal text-gray-400 capitalize">
                  {`  (${daysUntilDue(task.attributes.dueDate)})`}
                </span>
              </p>
            </TableCell>
            <TableCell className="font-medium text-gray-800 py-1.5">
              <AvatarImage
                customName={task.attributes.assigned.data.attributes.firstName}
                customImage={
                  task.attributes.assigned.data.attributes.picture.data
                    ?.attributes.url
                }
              />
            </TableCell>
            <TableCell className={statusBackground(task)}>
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
  );
}
