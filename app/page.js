"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import InspectionTable from "../components/InspectionTable";
import { getAllInspections } from "../utils/api/inspections";
import { getAllInvoices } from "../utils/api/invoices";
import qs from "qs";
import dynamic from "next/dynamic";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const useInspectionStatusCount = (inspections) => {
  const [statusCounts, setStatusCounts] = useState({
    projectsInProgress: 0,
    projectsNotStarted: 0,
    projectsCompleted: 0,
  });

  useEffect(() => {
    const countStatuses = () => {
      let inProgress = 0;
      let notStarted = 0;
      let completed = 0;

      inspections.forEach((inspection) => {
        switch (inspection.attributes.status) {
          case "in progress":
            inProgress++;
            break;
          case "not started":
            notStarted++;
            break;
          case "completed":
            completed++;
            break;
          default:
            break;
        }
      });

      setStatusCounts({
        projectsInProgress: inProgress,
        projectsNotStarted: notStarted,
        projectsCompleted: completed,
      });
    };

    countStatuses();
  }, [inspections]);

  return statusCounts;
};

const getMonthlyTotals = (invoices) => {
  // Initialize an array of 12 elements with zeroes for each month
  const monthlyTotals = Array(12).fill(0);

  invoices.forEach((invoice) => {
    const { total, datePaid } = invoice.attributes;

    // Extract the month from the datePaid (month is 0-based in JavaScript Date object)
    const month = new Date(datePaid).getMonth();

    // Add the total to the respective month
    monthlyTotals[month] += total;
  });

  return monthlyTotals;
};

const calculatePercentageChange = (totals) => {
  // Get today's date and extract the current month (0-based index)
  const today = new Date();
  const currentMonth = today.getMonth();

  // Get the previous month index (handle wrap-around for January)
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;

  const currentTotal = totals[currentMonth];
  const previousTotal = totals[previousMonth];

  if (previousTotal === 0) {
    return currentTotal === 0 ? 0 : 100; // 100% increase if previous is zero and current is not zero
  }

  const percentageChange =
    ((currentTotal - previousTotal) / previousTotal) * 100;
  return percentageChange;
};

export default function Home() {
  const [inspections, setInspections] = useState([]);
  const [invoices, setInvoices] = useState([]); // [1
  const { data: session } = useSession();
  const today = new Date();
  const currentMonth = today.getMonth();
  const chartRef = useRef(null);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentMonthName = monthNames[currentMonth];

  useEffect(() => {
    if (chartRef.current) {
      // Get the width of the chart container
      const chartWidth = chartRef.current.offsetWidth;
      console.log(`Chart Width: ${chartWidth}px`);
    }
  }, []);

  const totalSum = invoices
    .reduce((acc, invoice) => acc + invoice.attributes.total, 0)
    .toLocaleString();

  const monthlyTotals = getMonthlyTotals(invoices);

  // Calculate the month-to-month percentage change for the current month
  const percentageChange = calculatePercentageChange(monthlyTotals);

  const { projectsInProgress, projectsNotStarted, projectsCompleted } =
    useInspectionStatusCount(inspections);

  const option = {
    chart: {
      id: "apexchart-example",
      toolbar: {
        show: true, // Hides the toolbar
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
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
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

  const revenueOption = {
    chart: {
      id: "apexchart-example-alt",
      toolbar: {
        show: true, // Hides the toolbar
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
    colors: ["#62C3F7", "#F762A4", "#F7F162"], // Sets the color of the bars

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
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      labels: {
        show: true, // Hides the x-axis labels
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
    tooltip: {
      y: {
        formatter: function (value) {
          return `$${value.toFixed(2)}`;
        },
      },
    },
    annotations: {
      xaxis: [
        {
          x: (chartRef.current?.offsetWidth / 12) * currentMonth + 1 || 0,
          x2: (chartRef.current?.offsetWidth / 12) * (currentMonth + 1) || 0,
          borderColor: "#FF4560",
          label: {
            borderColor: "#FF4560",
            style: {
              color: "#fff",
              background: "#FF4560",
            },
            text: `Current Month ${currentMonthName}`,
          },
        },
      ],
    },
    // Add any other options you need here
  };

  const series = [
    {
      name: "series-1",
      data: [30, 40, 135, 50, 49, 60, 70],
    },
  ];

  const revenueSeries = [
    {
      name: "2021",
      data: getMonthlyTotals(invoices),
    },
    // {
    //   name: "2023",
    //   data: [50, 80, 75, 10, 69, 30, 149, 91, 66, 50, 30, 40],
    // },
    // {
    //   name: "2024",
    //   data: [55, 23, 48, 88, 34, 56, 78, 90, 12, 45, 67, 89],
    // },
    // {
    //   name: "2025",
    //   data: [88, 34, 56, 78, 90, 12, 45, 67, 89, 55, 23, 48],
    // },
  ];

  const projectsQuery = qs.stringify({
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

  const invoicesQuery = qs.stringify({
    filters: {
      isPaid: {
        $eq: true,
      },
    },
  });

  useEffect(() => {
    if (!session) return;

    const fetchProjects = async () => {
      const apiParams = {
        jwt: session?.accessToken,
        query: projectsQuery,
      };
      // Eventually you will want to do a Promise.all for all of the other project types
      const inspectionResponse = await getAllInspections(apiParams);

      setInspections(inspectionResponse.data.data);
    };

    const fetchInvoices = async () => {
      const apiParams = {
        jwt: session?.accessToken,
        query: "",
      };

      const invoiceResponse = await getAllInvoices(apiParams);
      console.log(invoiceResponse.data.data);

      setInvoices(invoiceResponse.data.data);
    };

    fetchProjects();
    fetchInvoices();
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
                <p className="text-3xl text-red-800">{projectsNotStarted}</p>
              </div>
              <p className=" text-sm text-center text-red-800 font-semibold mt-2">
                Not Started
              </p>
            </div>
            <div className="flex flex-col bg-yellow-50 py-14 rounded-lg">
              <div className="bg-yellow-100 p-5 rounded-full m-auto">
                <p className="text-3xl text-yellow-800">{projectsInProgress}</p>
              </div>
              <p className=" text-sm text-center text-yellow-800 font-semibold mt-2">
                In Progress
              </p>
            </div>
            <div className="flex flex-col bg-green-50 py-14 rounded-lg">
              <div className="bg-green-100 p-5 rounded-full m-auto">
                <p className="text-3xl text-green-600">{projectsCompleted}</p>
              </div>
              <p className=" text-sm text-center text-green-600 font-semibold mt-2">
                Completed
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full justify-center mt-8 mb-4 rounded-lg">
            <span className="flex items-center text-xs font-medium text-gray-900 dark:text-white me-3">
              <span className="flex w-2.5 h-2.5 bg-red-600 rounded-full me-1.5 flex-shrink-0"></span>
              Not Started
            </span>
            <span className="flex items-center text-xs font-medium text-gray-900 dark:text-white me-3">
              <span className="flex w-2.5 h-2.5 bg-yellow-500 rounded-full me-1.5 flex-shrink-0"></span>
              In Progress
            </span>
            <span className="flex items-center text-xs font-medium text-gray-900 dark:text-white me-3">
              <span className="flex w-2.5 h-2.5 bg-green-500 rounded-full me-1.5 flex-shrink-0"></span>
              Completed
            </span>
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
          <p className="text-gray-500">Structures Inspected</p>
          <div className="w-full mt-auto">
            <ApexChart
              type="bar"
              options={option}
              series={series}
              height={250}
              width={"100%"}
            />
          </div>
          {/* <FooterDateExport /> */}
        </div>
        <div className="bg-white gap-4 p-4 md:p-8 rounded-lg">
          <div className="flex justify-between h-11">
            <h3 className="text-3xl font-bold dark:text-white">${totalSum}</h3>
            <div>
              <span
                className={`text-base font-semibold ${
                  percentageChange > 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {percentageChange.toFixed(2)}%
              </span>
            </div>
          </div>
          <p className="text-gray-500">Revenue YTD</p>
          <div ref={chartRef} className="w-full mt-auto">
            <ApexChart
              type="area"
              options={revenueOption}
              series={revenueSeries}
              height={250}
              width={"100%"}
            />
          </div>
          {/* <FooterDateExport /> */}
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
