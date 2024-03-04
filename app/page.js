"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import FooterDateExport from "../components/Cards/FooterDateExport";
import InspectionTable from "../components/InspectionTable";
import qs from "qs";
import dynamic from "next/dynamic";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function Home() {
  const [inspections, setInspections] = useState([]);
  const { data: session } = useSession();

  const option = {
    chart: {
      id: "apexchart-example",
      toolbar: {
        show: false, // Hides the toolbar
      },
      zoom: {
        autoScaleYaxis: true, // Ensures the chart uses the full width
      },
      offsetX: -10, // Pulls the chart closer to the left edge of the container
      offsetY: 0, // Adjust vertically if needed
    },
    plotOptions: {
      bar: {
        horizontal: false, // set to false for vertical bars
        columnWidth: "60%", // Tries to maximize the width of the bars
        borderRadius: 10, // Rounds the corners of the bars (adjust as needed)
        barPadding: 0, // Minimize padding between bars
        // If you need more control over bar width, consider using 'rangeBarGroupRows' and 'barHeight' for horizontal bars
      },
    },
    colors: ["#62C3F7"], // Sets the color of the bars
    grid: {
      show: false, // Removes the grid background
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
    },
    xaxis: {
      categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999],
      axisBorder: {
        show: false, // Ensure the axis border is visible
      },
      axisTicks: {
        show: false, // Ensure the axis ticks are visible
      },
      position: "bottom", // Ensures the x-axis labels are positioned at the bottom
      labels: {
        show: true, // Ensures the x-axis labels are shown
        // ... other label options
      },
    },
    yaxis: {
      show: false, // Hides the y-axis
    },
    // Add any other options you need here
  };

  const optionAlt = {
    chart: {
      id: "apexchart-example-alt",
      toolbar: {
        show: false, // Hides the toolbar
      },
      sparkline: {
        enabled: true, // This will make the chart occupy the full space of its container
      },
      zoom: {
        autoScaleYaxis: true, // Ensures the chart uses the full width
      },
    },
    grid: {
      show: false, // Removes the grid background
    },
    colors: ["#62C3F7"], // Sets the color of the bars

    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 100],
        colorStops: [
          {
            offset: 0,
            color: "#62C3F7",
            opacity: 0.6,
          },
          {
            offset: 100,
            color: "#62C3F7",
            opacity: 0.0,
          },
        ],
      },
    },
    xaxis: {
      categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999],
      labels: {
        show: false, // Hides the x-axis labels
      },
      axisBorder: {
        show: false, // Hides the x-axis border
      },
      axisTicks: {
        show: false, // Hides the x-axis ticks
      },
    },
    yaxis: {
      show: false, // Hides the y-axis
    },
    // Add any other options you need here
  };

  const series = [
    {
      name: "series-1",
      data: [30, 40, 135, 50, 49, 60, 70, 91, 155],
    },
  ];

  const seriesAlt = [
    {
      name: "series-1",
      data: [50, 80, 75, 10, 69, 30, 149, 91, 66],
    },
  ];

  const query = qs.stringify({
    populate: {
      structures: {
        populate: {
          inspectors: {
            fields: ["username"],
          },
        },
      },
      client: {
        populate: {
          fields: ["name"],
        },
      },
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (session?.accessToken) {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/inspections?${query}`,
            {
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
              },
            }
          );
          setInspections(response.data.data);
        } catch (error) {
          console.error("Error fetching data", error.response || error);
        }
      }
    };

    fetchData();
  }, [session]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
        <div className="bg-white gap-4 p-4 md:p-8 rounded-lg">
          <div className="h-11">
            <h5 className="text-xl font-bold dark:text-white">
              Current Projects
            </h5>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full">
            <div className="flex flex-col bg-red-50 py-14 rounded-lg">
              <div className="bg-red-100 p-5 rounded-full m-auto">
                <p className="text-3xl text-red-800">50</p>
              </div>
              <p className="text-center text-red-800 font-semibold mt-2">
                To do
              </p>
            </div>
            <div className="flex flex-col bg-yellow-50 py-14 rounded-lg">
              <div className="bg-yellow-100 p-5 rounded-full m-auto">
                <p className="text-3xl text-yellow-800">50</p>
              </div>
              <p className="text-center text-yellow-800 font-semibold mt-2">
                In Progress
              </p>
            </div>
            <div className="flex flex-col bg-green-50 py-14 rounded-lg">
              <div className="bg-green-100 p-5 rounded-full m-auto">
                <p className="text-3xl text-green-600">50</p>
              </div>
              <p className="text-center text-green-600 font-semibold mt-2">
                Completed
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full justify-center mt-10 rounded-lg">
            <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
              <span className="flex w-2.5 h-2.5 bg-red-600 rounded-full me-1.5 flex-shrink-0"></span>
              To Do
            </span>
            <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
              <span className="flex w-2.5 h-2.5 bg-yellow-500 rounded-full me-1.5 flex-shrink-0"></span>
              In Progress
            </span>
            <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
              <span className="flex w-2.5 h-2.5 bg-green-500 rounded-full me-1.5 flex-shrink-0"></span>
              Completed
            </span>
          </div>
          <div className="mt-auto">
            <FooterDateExport />
          </div>
        </div>

        <div className="bg-white gap-4 p-4 md:p-8 rounded-lg">
          <div className="flex justify-between h-11">
            <h3 className="text-3xl font-bold dark:text-white">23</h3>
            <div>
              <span className="text-base font-semibold text-green-500">
                12%
              </span>
            </div>
          </div>
          <p className="text-gray-500">Products Inspected</p>
          <div className="w-full mt-auto">
            <ApexChart
              type="bar"
              options={option}
              series={series}
              height={250}
              width={"100%"}
            />
          </div>
          <FooterDateExport />
        </div>
        <div className="bg-white gap-4 p-4 md:p-8 rounded-lg">
          <div className="flex justify-between h-11">
            <h3 className="text-3xl font-bold dark:text-white">$495,999</h3>
            <div>
              <span className="text-base font-semibold text-green-500">
                12%
              </span>
            </div>
          </div>
          <p className="text-gray-500">Products Inspected</p>
          <div className="w-full mt-auto">
            <ApexChart
              type="area"
              options={optionAlt}
              series={seriesAlt}
              height={250}
              width={"100%"}
            />
          </div>
          <FooterDateExport />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-4 shadow-none">
        <div className="border-gray-300 rounded-lg dark:border-gray-600 bg-white p-0 shadow-none">
          <InspectionTable inspectionData={inspections} />
        </div>
      </div>
    </>
  );
}
