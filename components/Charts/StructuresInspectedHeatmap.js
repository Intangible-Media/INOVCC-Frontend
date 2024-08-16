"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function StructuresInspectedHeatmap({ structures = [] }) {
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    // Create an array with 24 elements for each hour of the day.
    const hourlyCounts = Array(24).fill(0);

    structures.forEach((structure) => {
      const inspectionDate = structure.attributes.inspectionDate;

      if (!inspectionDate) {
        console.warn("Inspection date is missing for structure:", structure);
        return; // Skip this structure if the inspection date is missing
      }

      try {
        const date = new Date(inspectionDate);

        if (isNaN(date.getTime())) {
          console.warn("Invalid date format:", inspectionDate);
          return; // Skip if the date is invalid
        }

        const hour = date.getHours(); // Get the hour from the inspectionDate
        hourlyCounts[hour] += 1;
      } catch (error) {
        console.error(
          "Error processing date:",
          error,
          "for inspectionDate:",
          inspectionDate
        );
      }
    });

    // Prepare heatmap data for ApexCharts
    const heatmapSeries = [
      {
        name: "",
        data: hourlyCounts.map((count, hour) => ({
          x: new Date(1970, 0, 1, hour).getTime(), // Using a base date to plot hours on a datetime scale
          y: count,
        })),
      },
    ];

    setHeatmapData(heatmapSeries);
  }, [structures]);

  const options = {
    chart: {
      type: "heatmap",
      height: 350,
      legend: {
        show: false,
      },
    },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        colorScale: {
          ranges: [
            {
              from: 0,
              to: 0,
              color: "#F2F2F2",
              name: "No Inspections",
            },
            {
              from: 1,
              to: 10,
              color: "#A5D6A7",
              name: "1-10 Inspections",
            },
            {
              from: 11,
              to: 20,
              color: "#66BB6A",
              name: "11-20 Inspections",
            },
            {
              from: 21,
              to: 50,
              color: "#43A047",
              name: "21-50 Inspections",
            },
            {
              from: 51,
              to: 100,
              color: "#2E7D32",
              name: "51-100 Inspections",
            },
            {
              from: 101,
              to: 200,
              color: "#1B5E20",
              name: "101-200 Inspections",
            },
          ],
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      type: "datetime",
      labels: {
        show: true,
        formatter: function (value) {
          const date = new Date(value);
          let hours = date.getHours();
          const minutes = date.getMinutes();
          const ampm = hours >= 12 ? "PM" : "AM";
          hours = hours % 12;
          hours = hours ? hours : 12; // the hour '0' should be '12'
          const minutesStr = minutes < 10 ? "0" + minutes : minutes;
          return `${hours}:${minutesStr} ${ampm}`;
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        show: true,
      },
    },
    title: {
      text: "",
      align: "center",
    },
    legend: {
      show: false,
    },
  };

  return (
    <ApexChart
      options={options}
      series={heatmapData}
      type="heatmap"
      height={100}
      width={"100%"}
    />
  );
}
