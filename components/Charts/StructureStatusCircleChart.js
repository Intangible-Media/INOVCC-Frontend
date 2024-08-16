"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { statusColors } from "../../utils/collectionListAttributes";
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function StructureStatusCircleChart({ structures = [] }) {
  const [activeCompletion, setActiveCompletion] = useState([0, 0]); // Updated to hold two values
  const [structureProgressType, setStructureProgressType] = useState("All");
  const [options, setOptions] = useState({
    series: [],
    chart: {
      type: "donut",
      offsetY: 20,
    },
    colors: [], // Will be dynamically set based on status colors
    plotOptions: {
      pie: {
        donut: {
          size: "85%", // Make the donut more hollow
          labels: {
            show: true,
            name: {
              offsetY: 30,
              show: true,
              color: "#111928",
              fontSize: "17px",
            },
            value: {
              offsetY: -15,
              color: "#111928",
              fontSize: "38px",
              show: true,
            },
            total: {
              showAlways: true,
              show: true,
              label: "Total",
              formatter: function (w) {
                return structures.length;
              },
              name: {
                offsetY: 30,
                show: true,
                color: "#111928",
                fontSize: "17px",
              },
              value: {
                offsetY: -15,
                color: "#111928",
                fontSize: "38px",
                show: true,
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    labels: [],
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      offsetY: 0,
    },
  });

  const getAllStructureTypes = () => {
    const types = structures.map((structure) => structure.attributes.type);
    const uniqueTypes = [...new Set(types)]; // Removes duplicates
    return uniqueTypes;
  };

  /**
   * Updates the progress bars based on the percentage of structures by their statuses.
   *
   * @param {string} type - The type of structures to consider. Defaults to "all".
   */
  const updateProgressBar = (type = "all") => {
    type = type.trim().toLowerCase();

    const filteredStructuresByType = structures.filter(
      (structure) =>
        type === "all" || structure.attributes.type.toLowerCase() === type
    );

    // Get all unique statuses
    const statuses = [
      ...new Set(
        filteredStructuresByType.map((structure) => structure.attributes.status)
      ),
    ];

    // Calculate the percentage of each status
    const statusPercentages = statuses.map((status) => {
      const structuresWithStatus = filteredStructuresByType.filter(
        (structure) => structure.attributes.status === status
      );
      return {
        status,
        percentage: Math.round(
          (structuresWithStatus.length / filteredStructuresByType.length) * 100
        ),
      };
    });

    // Sort status percentages by percentage in descending order
    statusPercentages.sort((a, b) => b.percentage - a.percentage);

    // Update series, labels, and colors
    const percentages = statusPercentages.map((item) => item.percentage);
    const labels = statusPercentages.map((item) => item.status);
    const colors = statusPercentages.map(
      (item) => statusColors[item.status] || "#cccccc"
    ); // Default to gray if color not found

    setActiveCompletion(percentages);
    setOptions((prevOptions) => ({
      ...prevOptions,
      labels,
      series: percentages,
      colors, // Set the colors dynamically based on the statuses
    }));
  };

  useEffect(() => {
    updateProgressBar(structureProgressType);
  }, [structureProgressType, structures]); // Depend on structures as well

  return (
    <div className="inspection-map-box flex col-span-4 md:col-span-1 flex-col border-gray-300 bg-white gap-4 p-6 md:p-8 rounded-lg">
      <div className="flex justify-between">
        <div>
          <h6 className="text-lg font-semibold">Structure Status</h6>
          <select
            className="block pb-2.5 pt-0 px-0 w-36 text-sm font-medium text-dark-blue-700 bg-transparent border-0 appearance-none dark:text-gray-400 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
            value={structureProgressType}
            onChange={(e) => {
              setStructureProgressType(e.target.value);
            }}
          >
            <option value="All">All</option>
            {getAllStructureTypes().map((structureType, index) => (
              <option key={index} value={structureType}>
                {structureType}
              </option>
            ))}
          </select>
        </div>
        <div></div>
      </div>
      <div className="w-full mt-auto md:mt-0">
        <div className="h-[400px] md:h-[400px] -mb-12 -mt-8">
          <ApexChart
            type="donut"
            options={options}
            series={activeCompletion}
            height={"100%"}
            width={"100%"}
          />
        </div>
      </div>
    </div>
  );
}
