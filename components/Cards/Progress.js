"use client";

import { useRouter } from "next/navigation";
import { Progress } from "flowbite-react";

const ProgressCard = ({ team, totalStructures, inspectedCount }) => {
  const router = useRouter();

  const progress = totalStructures
    ? (inspectedCount / totalStructures) * 100
    : 0;

  return (
    <div
      className="bg-white hover:bg-gray-50 rounded-lg p-5 aspect-video overflow-hidden border cursor-pointer flex flex-col justify-between"
      onClick={() => router.push(`/schedules/${team.id}`)}
    >
      <div className="flex flex-col gap-2">
        <h4 className="leading-none font-medium text-md">
          {team.attributes.name}
        </h4>
        <div className="flex gap-3">
          <p className="text-xs">{totalStructures} Total</p>
          <p className="text-xs">
            {totalStructures - inspectedCount} Remaining
          </p>
        </div>
      </div>
      {totalStructures > 0 && (
        <Progress progress={progress} textLabel="" size="md" color="blue" />
      )}
    </div>
  );
};

export default ProgressCard;
