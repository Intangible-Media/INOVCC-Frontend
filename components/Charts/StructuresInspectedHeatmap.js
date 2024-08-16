"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function StructuresInspectedHeatmap({ structures = [] }) {
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    // Create an array with 48 elements for each 30-minute interval of the day (24 hours * 2).
    const intervalCounts = Array(48).fill(0);

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

        const hour = date.getHours();
        const minutes = date.getMinutes();
        const intervalIndex = hour * 2 + (minutes >= 30 ? 1 : 0); // Determine the index for the 30-minute interval
        intervalCounts[intervalIndex] += 1;
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
        data: intervalCounts.map((count, index) => {
          const hour = Math.floor(index / 2);
          const minutes = index % 2 === 0 ? "00" : "30";
          const time = new Date(1970, 0, 1, hour, minutes).getTime(); // Using a base date to plot hours on a datetime scale
          return {
            x: time,
            y: count,
          };
        }),
      },
    ];

    setHeatmapData(heatmapSeries);
  }, [structures]);

  const options = {
    chart: {
      type: "heatmap",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.75,
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
              to: 5,
              color: "#A5D6A7",
              name: "1-10 Inspections",
            },
            {
              from: 6,
              to: 10,
              color: "#66BB6A",
              name: "11-20 Inspections",
            },
            {
              from: 11,
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
        show: false,
        formatter: function (value) {
          const date = new Date(value);
          let hours = date.getHours();
          const minutes = date.getMinutes();
          const ampm = hours >= 12 ? "PM" : "AM";
          hours = hours % 12;
          hours = hours ? hours : 12; // the hour '0' should be '12'
          const minutesStr = minutes < 10 ? "0" + minutes : minutes;

          // Only show the label for times at the start of each hour
          if (minutesStr === "00") {
            return `${hours} ${ampm}`;
          }
          return "";
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
      show: true,
    },
  };

  return (
    <ApexChart
      options={options}
      series={heatmapData}
      type="heatmap"
      height={80}
      width={"100%"}
    />
  );
}
