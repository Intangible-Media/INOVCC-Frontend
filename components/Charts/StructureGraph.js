// components/RevenueChart.js

"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

/**
 * Function to group structures by their type.
 * @param {Array} structures - The array of structure objects.
 * @returns {Object} An object with keys as types and values as arrays of structures.
 */
function groupStructuresByType(structures) {
  return structures.reduce((acc, structure) => {
    const type = structure.attributes.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(structure);
    return acc;
  }, {});
}

/**
 * Function to get all keys (dates, weeks, months, years) in the specified range based on the aggregation level.
 * @param {Date} startDate - The start date.
 * @param {Date} endDate - The end date.
 * @param {string} level - The aggregation level ('day', 'week', 'month', 'year').
 * @returns {Array} An array of all keys in the specified range.
 */
function getAllKeysInRange(startDate, endDate, level) {
  const keys = [];
  let currentDate = new Date(startDate).setHours(0, 0, 0, 0);
  const end = new Date(endDate).setHours(0, 0, 0, 0);

  while (currentDate <= end) {
    const date = new Date(currentDate);
    let key;

    if (level === "day") {
      key = date.toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
      });
      currentDate += 24 * 60 * 60 * 1000; // Add one day
    } else if (level === "week") {
      const startOfWeek = new Date(currentDate);
      const endOfWeek = new Date(currentDate + 6 * 24 * 60 * 60 * 1000); // Add six days
      key = `${startOfWeek.getDate()}/${
        startOfWeek.getMonth() + 1
      } - ${endOfWeek.getDate()}/${endOfWeek.getMonth() + 1}`;
      currentDate += 7 * 24 * 60 * 60 * 1000; // Add one week
    } else if (level === "month") {
      key = date.toLocaleDateString("en-US", { month: "long" });
      currentDate = new Date(date.setMonth(date.getMonth() + 1)).setHours(
        0,
        0,
        0,
        0
      ); // Add one month
    } else if (level === "year") {
      key = `${date.getFullYear()}`;
      currentDate = new Date(date.setFullYear(date.getFullYear() + 1)).setHours(
        0,
        0,
        0,
        0
      ); // Add one year
    }

    keys.push(key);
  }

  return keys;
}

/**
 * Function to aggregate data based on the specified level.
 * @param {Array} structures - The array of structure objects.
 * @param {string} level - The aggregation level ('day', 'week', 'month', 'year').
 * @param {Date} startDate - The start date.
 * @param {Date} endDate - The end date.
 * @returns {Array} An array of objects with keys and counts.
 */
function aggregateData(structures, level, startDate, endDate) {
  const keys = getAllKeysInRange(startDate, endDate, level);
  const aggregatedData = keys.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {});

  structures.forEach((item) => {
    const date = new Date(item.attributes.inspectionDate);
    let key;

    if (level === "day") {
      key = date.toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
      });
    } else if (level === "week") {
      const startOfWeek = new Date(
        date.setDate(date.getDate() - date.getDay())
      );
      const endOfWeek = new Date(
        startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000
      );
      key = `${startOfWeek.getDate()}/${
        startOfWeek.getMonth() + 1
      } - ${endOfWeek.getDate()}/${endOfWeek.getMonth() + 1}`;
    } else if (level === "month") {
      key = date.toLocaleDateString("en-US", { month: "long" });
    } else if (level === "year") {
      key = `${date.getFullYear()}`;
    }

    if (aggregatedData[key] !== undefined) {
      aggregatedData[key] += 1;
    }
  });

  return Object.keys(aggregatedData).map((key) => ({
    key,
    count: aggregatedData[key],
  }));
}

export default function RevenueChart({
  structures,
  aggregation,
  startDate,
  endDate,
}) {
  const [xaxisCategories, setXaxisCategories] = useState([]);
  const [seriesData, setSeriesData] = useState([]);

  useEffect(() => {
    const aggregationLevel = aggregation || "day";
    const groupedStructures = groupStructuresByType(structures);

    const series = Object.keys(groupedStructures).map((type) => {
      const typeStructures = groupedStructures[type];
      const aggregatedData = aggregateData(
        typeStructures,
        aggregationLevel,
        startDate,
        endDate
      );
      return {
        name: type,
        data: aggregatedData.map((item) => item.count),
      };
    });

    const aggregatedData = aggregateData(
      structures,
      aggregationLevel,
      startDate,
      endDate
    );
    setXaxisCategories(aggregatedData.map((item) => item.key));
    setSeriesData(series);
  }, [structures, aggregation, startDate, endDate]);

  const options = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: {
        show: true,
      },
      zoom: {
        enabled: true,
      },
      offsetY: 0,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 10,
        columnWidth: "70%", // Adjust this to make bars narrower and create space
        borderRadiusApplication: "around", // Apply border radius around the entire bar
        borderRadiusWhenStacked: "all", // Apply border radius to all bars when stacked
      },
    },
    colors: [
      "#6366F1",
      "#10B981",
      "#F59E0B",
      "#EC4899",
      "#F472B6",
      "#0EA5E9",
      "#3B82F6",
      "#22C55E",
      "#EF4444",
      "#84CC16",
      "#14B8A6",
      "#E11D48",
      "#06B6D4",
      "#8B5CF6",
      "#D946EF",
      "#F97316",
      "#EAB308",
    ],
    grid: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: xaxisCategories,
      labels: {
        show: true,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      show: false,
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      offsetY: 0,
      offsetX: -34,
    },
    fill: {
      opacity: 1,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: "bottom",
            offsetX: -10,
            offsetY: 0,
          },
        },
      },
    ],
  };

  return (
    <ApexChart
      className="w-[700px] h-[400px] md:w-full"
      type="bar"
      options={options}
      series={seriesData}
      height="100%"
      width="100%"
    />
  );
}
