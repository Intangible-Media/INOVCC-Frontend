import React from "react";

const formatTime = (time) => {
  const [hour, minute] = time.split(":");
  const period = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minute} ${period}`;
};

const calculatePosition = (time) => {
  const [hour, minute] = time.split(":").map(Number);
  const totalMinutes = (hour - 8) * 60 + minute;
  const percentage = (totalMinutes / (12 * 60)) * 100;
  return percentage;
};

const HorizontalTimeline = ({ events }) => {
  return (
    <div className="relative flex items-center w-full h-16">
      <div className="absolute top-[8px] w-full border-t border-gray-300"></div>
      {events.map((event, index) => (
        <div
          key={index}
          className="absolute flex flex-col items-center top-0"
          style={{ left: `${calculatePosition(event.time)}%` }}
        >
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <div className="mt-2 text-center">
            <h3 className="text-sm font-semibold ">{event.title}</h3>
            <p className="text-xs text-gray-400">{formatTime(event.time)}</p>
            <p className="text-xs text-gray-400">{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HorizontalTimeline;
