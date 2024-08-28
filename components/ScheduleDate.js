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
    <>
      <Datepicker
        className="w-full md:w-[400px]"
        defaultDate={date}
        onSelectedDateChanged={(selectedDate) => redirectPage(selectedDate)}
      />
    </>
  );
}
