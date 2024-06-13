"use client";

import React from "react";
import { Button, Popover } from "flowbite-react";

const formatTime = (time) => {
  const date = new Date(time);
  const hours = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes} ${period}`;
};

const calculatePosition = (time) => {
  const date = new Date(time);
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  const totalMinutes = hour * 60 + minute;
  const percentage = (totalMinutes / (24 * 60)) * 100;
  return percentage;
};

const HorizontalTimeline = ({ structures }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const content = (
    <div className="w-64 text-sm text-gray-500 dark:text-gray-400">
      <div className="border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Popover title
        </h3>
      </div>
      <div className="px-3 py-2">
        <p>And here's some amazing content. It's very engaging. Right?</p>
      </div>
    </div>
  );

  return (
    <div className="relative flex items-center w-full h-16">
      <div className="absolute top-[20px] w-full border-t border-gray-300"></div>
      {hours.map((hour) => (
        <div
          key={hour}
          className="absolute flex flex-col items-center"
          style={{ left: `${(hour / 24) * 100}%` }}
        >
          <div className=" w-[1px] h-4 bg-gray-300"></div>
          <div className="mt-1 text-xs text-gray-300">{`${hour}:00`}</div>
        </div>
      ))}
      {structures.map((structure, index) => (
        <div
          key={index}
          className="absolute flex flex-col items-center top-[15px]"
          style={{
            left: `${calculatePosition(structure.attributes.inspectionDate)}%`,
          }}
        >
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          {/* <div className="mt-2 text-center">
            <h3 className="text-sm font-semibold text-dark-blue-700">
              {structure.attributes.mapSection}
            </h3>
            <p className="text-xs text-gray-400">
              {formatTime(structure.attributes.inspectionDate)}
            </p>
            <p className="text-xs text-gray-400">
              {structure.attributes.inspectionDate}
            </p>
          </div> */}
        </div>
      ))}
    </div>
  );
};

export default HorizontalTimeline;
