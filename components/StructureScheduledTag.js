import { FaRegCalendarCheck } from "react-icons/fa6";
import { formatDateToMonthDay } from "../utils/strings";

export default function StructureScheduledTag({ structure }) {
  const { scheduleStart, scheduleEnd } = structure.attributes;

  const options = { month: "short", day: "numeric" };

  const formatLocalDate = (dateString) => {
    if (!dateString) {
      return null; // Return an empty string or a placeholder if dateString is null or undefined
    }
    const [year, month, day] = dateString.split("-");
    const date = new Date(year, month - 1, day); // Months are 0-based in JS
    return date.toLocaleDateString("en-US", options);
  };

  const formattedStartDate = formatLocalDate(scheduleStart);
  const formattedEndDate = formatLocalDate(scheduleEnd);

  return (
    <div className="flex gap-1.5">
      <FaRegCalendarCheck className="text-gray-400" size={11.5} />

      {formattedStartDate && formattedEndDate ? (
        <p className="font-medium text-xs leading-none text-gray-400">
          {`${formattedStartDate} - ${formattedEndDate}`}
        </p>
      ) : (
        <p className="font-medium text-xs leading-none text-gray-400">
          Not Scheduled
        </p>
      )}
    </div>
  );
}
