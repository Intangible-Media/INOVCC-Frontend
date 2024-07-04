"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import InspectionTable from "../components/InspectionTable";
import { getAllInspections } from "../utils/api/inspections";
import { getAllTeams } from "../utils/api/teams";
import { getAllInvoices } from "../utils/api/invoices";
import { getAllStructure } from "../utils/api/structures";
import { useRouter } from "next/navigation";
import qs from "qs";
import dynamic from "next/dynamic";
import RevenueChart from "../components/Charts/RevenueChart";

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
  const { data: session } = useSession();
  const [inspections, setInspections] = useState([]);
  const [teams, setTeams] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [structures, setStructures] = useState([]);
  const chartRef = useRef(null);
  const today = new Date();
  const currentMonth = today.getMonth();

  // Helper function to format dates as YYYY-MM-DD
  function formatDate(date) {
    return date.toISOString().split("T")[0];
  }

  // Get today's date
  const todayString = formatDate(today);

  // Calculate the date 6 days ago (7 days total including today)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);
  const sevenDaysAgoString = formatDate(sevenDaysAgo);

  // Create a new Date object for tomorrow
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Format the date as YYYY-MM-DD
  function formatDate(date) {
    return date.toISOString().split("T")[0];
  }

  const tomorrowString = formatDate(tomorrow);

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

  /**
   * Function to get the count of inspections for the last 7 days with today as the last day.
   * @param {Array} structures - The array of inspection objects.
   * @returns {Array} An array of length 7 where each element represents the number of inspections on that day.
   */
  function getLast7DaysInspections(structures) {
    const result = Array(7).fill(0);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ensure time is set to midnight

    structures.forEach((structure) => {
      const inspectionDate = new Date(structure.attributes.inspectionDate);
      inspectionDate.setHours(0, 0, 0, 0); // Ensure time is set to midnight
      const diffTime = today - inspectionDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // Only consider the last 7 days including today
      if (diffDays >= 0 && diffDays <= 6) {
        result[6 - diffDays] += 1;
      }
    });

    return result;
  }

  /**
   * Function to get the days of the week with today as the last day.
   * @returns {Array} An array of days of the week with today as the last day.
   */
  function getDaysOfWeekWithTodayLast() {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const dayOfWeek = today.getDay();

    // Rotate the daysOfWeek array so that today is the last day
    return daysOfWeek
      .slice(dayOfWeek + 1)
      .concat(daysOfWeek.slice(0, dayOfWeek + 1));
  }

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
   * Function to create series data for ApexCharts.
   * @param {Object} groupedStructures - The grouped structures by type.
   * @returns {Array} An array of series objects for ApexCharts.
   */
  function createSeries(groupedStructures) {
    return Object.keys(groupedStructures).map((type) => ({
      name: type,
      data: getLast7DaysInspections(groupedStructures[type]),
    }));
  }

  const groupedStructures = groupStructuresByType(structures);
  const series = createSeries(groupedStructures);

  const options = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: {
        show: true,
        offsetY: 30,
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
        // borderRadiusApplication: "end",
        // borderRadiusWhenStacked: "last",
        borderRadiusApplication: "around", // Apply border radius around the entire bar
        borderRadiusWhenStacked: "all", // Apply border radius to all bars when stacked
        // borderRadiusApplication: "end", // Apply border radius to the end of the bar
        // borderRadiusWhenStacked: "last", // Apply border radius to the last bar when stacked
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
      categories: getDaysOfWeekWithTodayLast(),
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
      horizontalAlign: "right",
      offsetY: 0,
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

  // const series = [
  //   {
  //     name: "Inspections",
  //     data: getLast7DaysInspections(structures),
  //   },
  //   {
  //     name: "Alt Inspections",
  //     data: getLast7DaysInspections(structures),
  //   },
  // ];

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

  const teamsQuery = qs.stringify(
    {
      populate: {
        structures: {
          filters: {
            scheduleForInspection: {
              $eq: today,
            },
          },
        },
      },
    },
    {
      encodeValuesOnly: true, // prettify URL
    }
  );

  const structuresQuery = qs.stringify({
    filters: {
      status: {
        $eq: "Inspected",
      },
      inspectionDate: {
        $gte: sevenDaysAgoString,
        $lte: tomorrowString,
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
      // console.log("inspectionResponse.data.data");
      // console.log(inspectionResponse.data.data);
      setInspections(inspectionResponse.data.data);
    };

    const fetchTeams = async () => {
      const teams = await getAllTeams({
        jwt: session.accessToken,
        query: teamsQuery,
      });
      console.log(teams.data.data);
      setTeams(teams.data.data);
    };

    const fetchStructures = async () => {
      const apiParams = {
        jwt: session?.accessToken,
        query: structuresQuery,
      };
      // Eventually you will want to do a Promise.all for all of the other project types
      const structuresResponse = await getAllStructure(apiParams);
      console.log("structuresResponse.data.data");
      console.log(structuresResponse.data.data);
      setStructures(structuresResponse.data.data);
    };

    const fetchInvoices = async () => {
      const apiParams = {
        jwt: session?.accessToken,
        query: "",
      };
      const invoiceResponse = await getAllInvoices(apiParams);

      setInvoices(invoiceResponse.data.data);
    };

    fetchProjects();
    fetchTeams();
    fetchStructures();
    fetchInvoices();
  }, [session]);

  const ProgressCard = ({ team }) => {
    const router = useRouter();

    return (
      <div
        className="bg-white hover:bg-gray-50 rounded-lg p-5 aspect-video overflow-hidden border cursor-pointer flex flex-col justify-between"
        onClick={() => router.push(`/schedules/${team.id}`)}
      >
        <div className="flex flex-col gap-2">
          <h4 className="leading-none font-medium text-md text-dark-blue-700">
            {team.attributes.name}
          </h4>
        </div>
        <div className="flex gap-2">
          <div className="flex w-7 h-7 bg-gray-200 rounded-full text-gray-700">
            <p className="text-xs m-auto">{0}</p>
          </div>

          <div className="flex w-7 h-7 bg-yellow-100 rounded-full text-yellow-700">
            <p className="text-xs m-auto">{0}</p>
          </div>

          <div className="flex w-7 h-7 bg-green-100 rounded-full text-green-700">
            <p className="text-xs m-auto">{0}</p>
          </div>

          <div className="flex w-7 h-7 bg-red-200 rounded-full text-red-800">
            <p className="text-xs m-auto">{0}</p>
          </div>

          <div className="flex w-7 h-7 bg-green-700 rounded-full text-white">
            <p className="text-xs m-auto">{0}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
        <div className="flex flex-col justify-between bg-white gap-0 p-4 md:p-6 rounded-lg">
          <div className="h-11">
            <h5 className="text-xl font-bold dark:text-white">
              Current Projects
            </h5>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            <div className="flex flex-col bg-gray-50 rounded-lg p-7">
              <div className="bg-gray-200 p-3.5 md:p-5 rounded-full m-auto">
                <p className="text-2xl md:text-3xl text-gray-800">
                  {projectsNotStarted}
                </p>
              </div>
              <p className=" text-sm text-center text-gray-800 font-semibold mt-2">
                Not Started
              </p>
            </div>

            <div className="flex flex-col bg-yellow-50 rounded-lg p-7">
              <div className="bg-yellow-100 p-3.5 md:p-5 rounded-full m-auto">
                <p className="text-2xl md:text-3xl text-yellow-800">
                  {projectsInProgress}
                </p>
              </div>
              <p className=" text-sm text-center text-yellow-800 font-semibold mt-2">
                In Progress
              </p>
            </div>

            <div className="flex flex-col bg-red-50 rounded-lg p-7">
              <div className="bg-red-100 p-3.5 md:p-5 rounded-full m-auto">
                <p className="text-2xl md:text-3xl text-red-800">0</p>
              </div>
              <p className=" text-sm text-center text-red-800 font-semibold mt-2">
                Late
              </p>
            </div>

            <div className="flex flex-col bg-green-50 rounded-lg p-7">
              <div className="bg-green-100 p-3.5 md:p-5 rounded-full m-auto">
                <p className="text-2xl md:text-3xl text-green-600">
                  {projectsCompleted}
                </p>
              </div>
              <p className=" text-sm text-center text-green-600 font-semibold mt-2">
                Completed
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white gap-4 p-4 md:p-6 rounded-lg">
          <div className="flex justify-between h-11">
            <h3 className="text-3xl font-bold dark:text-white">
              {structures.length}
            </h3>
          </div>
          <p className="text-gray-500 mb-4">Weekly Inspections</p>
          <div className="w-full mt-auto">
            <div style={{ height: "300px" }}>
              <ApexChart
                type="bar"
                options={options}
                series={series}
                height={"100%"}
                width={"100%"}
              />
            </div>
          </div>
        </div>
        <div className="bg-white gap-4 p-4 md:p-6 rounded-lg">
          <RevenueChart invoices={invoices} />
        </div>
      </div>

      <section className="grid grid-col p-0 rounded-md gap-4 mb-4">
        <div className="flex flex-col col-span-5 gap-3">
          <div className="shadow-sm border-gray-400 bg-slate-50 p-4 md:p-6 rounded-lg w-full h-full">
            <h5 className="text-xl font-bold dark:text-white mb-3">
              Teams Scheduled
            </h5>
            <div className=" inline-grid md:grid grid-cols-1 md:grid-cols-5 gap-4">
              {teams.map((team, index) => (
                <ProgressCard key={index} team={team} showEmpty={false} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 mb-4 shadow-none">
        <div className="border-gray-300 rounded-lg dark:border-gray-600 bg-white p-0 shadow-none">
          <InspectionTable inspectionData={inspections} />
        </div>
      </div>
    </>
  );
}
