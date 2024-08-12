import { formatDateToMonthDay } from "../utils/strings";

export default function StructureScheduledTag({ structure }) {
  const { scheduleStart, scheduleEnd } = structure.attributes;

  const formatedStartDate = formatDateToMonthDay(
    structure.attributes.scheduleStart
  );
  const formatedEndDate = formatDateToMonthDay(
    structure.attributes.scheduleEnd
  );
  return (
    <div className="flex gap-2">
      <h5 className="font-medium text-sm leading-none text-gray-800">
        Scheduled
      </h5>
      {scheduleStart && scheduleEnd ? (
        <p className="font-medium text-sm leading-none text-gray-500">
          {`${formatedStartDate} - ${formatedEndDate}`}
        </p>
      ) : (
        <p className="font-medium text-sm leading-none text-gray-500">
          Not Scheduled
        </p>
      )}
    </div>
  );
}
