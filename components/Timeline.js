"use client";

import React from "react";
import { Button, Popover } from "flowbite-react";
import { useState } from "react";
import { ensureDomain } from "../utils/strings";

const formatTime = (time) => {
  const period = time >= 12 ? "PM" : "AM";
  const formattedHours = time % 12 || 12;
  return `${formattedHours}${period}`;
};

const calculatePosition = (time) => {
  const date = new Date(time);
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  const totalMinutes = hour * 60 + minute;
  const percentage = (totalMinutes / (24 * 60)) * 100;
  return percentage;
};

const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="relative w-full h-48 overflow-hidden">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <img
            key={index}
            src={ensureDomain(image.attributes.url)}
            className="min-w-full h-full object-cover"
            alt={`Structure Image ${index + 1}`}
          />
        ))}
      </div>
      <button
        onClick={prevImage}
        className="absolute opacity-0 hover:opacity-100 left-0 top-1/2 transform -translate-y-1/2 bg-black text-white p-1"
      >
        &#8592;
      </button>
      <button
        onClick={nextImage}
        className="absolute opacity-0 hover:opacity-100 right-0 top-1/2 transform -translate-y-1/2 bg-black text-white p-1"
      >
        &#8594;
      </button>
    </div>
  );
};

const Tooltip = ({ children, structure }) => {
  const structureImages = structure.attributes.images.data || [];
  return (
    <div className="relative flex flex-col items-center group">
      {children}
      <div className="absolute bottom-0 flex flex-col items-center hidden mb-3 group-hover:flex rounded-md">
        <span className="relative z-10 p-4 text-xs leading-none text-white whitespace-no-wrap bg-white shadow-lg rounded-md">
          <div className="w-64 text-sm text-gray-500 dark:text-gray-400">
            <div className="border-b border-gray-200 pb-2 dark:border-gray-600 dark:bg-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {structure.attributes.mapSection}
              </h3>
            </div>
            <div>
              <ImageSlider images={structureImages} />
            </div>
          </div>
        </span>
        <div className="w-3 h-3 -mt-2 rotate-45 bg-white"></div>
      </div>
    </div>
  );
};

const HorizontalTimeline = ({ structures }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="relative flex items-center w-full h-16 min-w-[1100px]">
      <div className="absolute top-[20px] w-full border-t border-gray-300"></div>
      {hours.map((hour) => (
        <div
          key={hour}
          className="absolute flex flex-col items-center"
          style={{ left: `${(hour / 24) * 100}%` }}
        >
          <div className=" w-[1px] h-4 bg-gray-300"></div>
          <div className="mt-1 text-xs text-gray-300">{`${formatTime(
            hour
          )}`}</div>
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
          <Tooltip key={index} structure={structure}>
            <div
              className={`w-3 h-3 ${
                structure.attributes.status === ("Inspected" || "Uploaded")
                  ? "bg-green-500"
                  : "bg-red-500"
              } rounded-full`}
            ></div>
          </Tooltip>
        </div>
      ))}
    </div>
  );
};

export default HorizontalTimeline;
