import { formatDateToMonthDay } from "../utils/strings";

export default function StructureScheduledTag({ structure }) {
  const { scheduleStart, scheduleEnd } = structure.attributes;

  const options = { month: "short", day: "numeric" };

  const formatLocalDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    const date = new Date(year, month - 1, day); // Months are 0-based in JS
    return date.toLocaleDateString("en-US", options);
  };

  const formattedStartDate = formatLocalDate(scheduleStart);
  const formattedEndDate = formatLocalDate(scheduleEnd);

  return (
    <div className="flex gap-2">
      <h5 className="font-medium text-xs leading-none text-gray-800">
        Scheduled
      </h5>
      {scheduleStart && scheduleEnd ? (
        <p className="font-medium text-xs leading-none text-gray-500">
          {`${formattedStartDate} - ${formattedEndDate}`}
        </p>
      ) : (
        <p className="font-medium text-xs leading-none text-gray-500">
          Not Scheduled
        </p>
      )}
    </div>
  );
}
