"use client";

import { Datepicker } from "flowbite-react";
import { useRouter } from "next/navigation";

export default function ScheduleDate({ date, teamId }) {
  const router = useRouter();

  const redirectPage = (selectedDate) => {
    // Ensure selectedDate is converted to a string format if it's a Date object
    const dateStr =
      selectedDate instanceof Date ? selectedDate.toISOString() : selectedDate;
    const encodedDate = encodeURIComponent(dateStr);

    router.push(`/schedules/${teamId}?date=${encodedDate}`);
  };

  return (
    <div className="flex flex-col gap-1 my-auto">
      <h6 className="text-sm font-light">Select a date to view the schedule</h6>
      <Datepicker
        className="w-full md:w-[400px] datepicker-background"
        defaultDate={date}
        onSelectedDateChanged={(selectedDate) => redirectPage(selectedDate)}
      />
    </div>
  );
}
