"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function StructureStatusCircleChart({ structures = [] }) {
  const [activeCompletion, setActiveCompletion] = useState(0);
  const [structureProgressType, setStructureProgressType] = useState("All");
  const [options, setOptions] = useState({
    series: [70],
    chart: {
      type: "radialBar",
      offsetY: 0,
    },
    colors: ["#FDF6B2"],
    plotOptions: {
      radialBar: {
        hollow: {
          size: "72%",
        },
        dataLabels: {
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
            fontSize: "48px",
            show: true,
          },
        },
      },
    },
    labels: ["All"],
  });

  const getAllStructureTypes = () => {
    const types = structures.map((structure) => structure.attributes.type);
    const uniqueTypes = [...new Set(types)]; // Removes duplicates
    return uniqueTypes;
  };

  /**
   * Updates the progress bar based on the percentage of inspected structures.
   *
   * @param {string} type - The type of structures to consider. Defaults to "all".
   */
  const updateProgressBar = (type = "all") => {
    type = type.trim().toLowerCase();

    const filteredStructuresByType = structures.filter(
      (structure) =>
        type === "all" || structure.attributes.type.toLowerCase() === type
    );

    const inspectedStructures = filteredStructuresByType.filter(
      (structure) => structure.attributes.status.toLowerCase() === "inspected"
    );

    const percentOfCompletion =
      filteredStructuresByType.length > 0
        ? Math.round(
            (inspectedStructures.length / filteredStructuresByType.length) * 100
          )
        : 0;

    setActiveCompletion(percentOfCompletion);
  };

  useEffect(() => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      labels: [structureProgressType],
    }));
  }, [structureProgressType]);

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
        <div className=" h-[400px] md:h-[400px] -mb-12 -mt-8">
          <ApexChart
            type="radialBar"
            options={options}
            series={[activeCompletion]}
            height={"100%"}
            width={"100%"}
          />
        </div>
      </div>
    </div>
  );
}
