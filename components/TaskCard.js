import { Card, Badge, Button } from "flowbite-react";

export default function TaskCard({ task }) {
  const { title, description, urgency, dueDate, isComplete } = task.attributes;

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

  const UrgencyBadge = ({ urgency }) => {
    switch (urgency.toLowerCase()) {
      case "low":
        return (
          <div>
            <Badge color="green" className=" inline-block">
              Low
            </Badge>
          </div>
        );
      case "medium":
        return (
          <div>
            <Badge color="yellow" className=" inline-block">
              Medium
            </Badge>
          </div>
        );
      case "high":
        return (
          <div>
            <Badge color="red" className=" inline-block">
              High
            </Badge>
          </div>
        );
      default:
        return (
          <div>
            <Badge color="gray" className=" inline-block">
              Unknown
            </Badge>
          </div>
        );
    }
  };

  return (
    <div className="hover:bg-gray-50 cursor-pointer border rounded-md p-3">
      <UrgencyBadge urgency={urgency} />
      <h5 className="text-lg font-bold tracking-tight text-dark-blue-700 dark:text-white capitalize shorten-text mt-1.5 mb-1">
        {title}
      </h5>
      <p className="font-normal text-gray-500 dark:text-gray-400 h-6 shorten-text mb-2">
        {description}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-800">
          Due: {`${formatDate(task.attributes.dueDate)}`}
          <span className="font-normal text-gray-400 capitalize">
            {`  (${daysUntilDue(task.attributes.dueDate)})`}
          </span>
        </span>
      </div>
    </div>
  );
}
