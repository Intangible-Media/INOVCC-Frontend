"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Button, Progress, Select, Datepicker } from "flowbite-react";
import { HiArrowNarrowRight, HiCalendar } from "react-icons/hi";
import axios from "axios";
import InspectionTable from "../../components/InspectionTable";
import InspectionModal from "../../components/Modals/InspectionModal";
import InspectionCreateDrawer from "../../components/Drawers/InspectionCreateDrawer";
import FavoriteInspectionCard from "../../components/Cards/FavoriteInspectionCard";
import StructureTypesNumbers from "../../components/StructureTypesNumbers";
import ActivityLog from "../../components/ActivityLog";
import { SearchIconSmWhite } from "../../public/icons/intangible-icons";
import StructureGraph from "../../components/Charts/StructureGraph";
import { GoPlus } from "react-icons/go";
import qs from "qs";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function Dashboard() {
  const { data: session } = useSession();
  const [inspections, setInspections] = useState([]);
  const [favoriteInspections, setFavoriteInspections] = useState([]);
  const [dateRanggStructures, setDateRanggStructures] = useState([]);
  const [chartSeries, setChartSeries] = useState([]);
  const [clients, setClients] = useState([]);
  const [endDate, setEndDate] = useState(new Date());
  const [aggregation, setAggregation] = useState(null);
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30))
  );

  const allStructures = inspections
    .map((inspection) => inspection.attributes.structures.data || [])
    .flat();

  const inspectionQuery = qs.stringify({
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
      favorited_by: {
        fields: ["username"],
      },
    },
  });

  const formattedStartDate = startDate.toISOString();
  const formattedEndDate = endDate.toISOString();

  const structuresQuery = qs.stringify({
    filters: {
      inspectionDate: {
        $gt: formattedStartDate,
        $lt: formattedEndDate,
      },
    },
  });

  const favoriteInspectionsQuery = qs.stringify({
    filters: {
      favorited_by: {
        id: {
          $eq: session?.user.id,
        },
      },
    },
    populate: {
      structures: {
        fields: ["status", "name", "type"],
      },
    },
  });

  const colors = [
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
  ];

  const lightenColor = (color, percent) => {
    const num = parseInt(color.slice(1), 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) + amt,
      G = ((num >> 8) & 0x00ff) + amt,
      B = (num & 0x0000ff) + amt;

    return `#${(
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
      .toUpperCase()}`;
  };

  /**
   * This effect is responsible for fetching inspection data, structure data, and favorite inspections data.
   * It runs whenever the `session` or `inspectionQuery` changes.
   */
  useEffect(() => {
    /**
     * This async function fetches the data from the server.
     */
    const fetchInspectionData = async () => {
      // Check if there is an access token in the session
      if (session?.accessToken) {
        /**
         * This async function fetches data from a specific API endpoint.
         * @param {string} url - The API endpoint to fetch data from.
         * @param {string} query - The query parameters to include in the request.
         * @returns {Promise} A promise that resolves to the fetched data.
         */
        const fetchData = async (url, query) => {
          try {
            // Fetch the data from the server
            const response = await axios.get(
              `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/${url}?${query}`,
              {
                headers: { Authorization: `Bearer ${session.accessToken}` },
              }
            );
            // Return the fetched data
            return response.data.data;
          } catch (error) {
            // Log any errors that occurred while fetching the data
            console.error(`Error fetching ${url}`, error.response || error);
          }
        };

        // Fetch the inspection data, structure data, and favorite inspections data concurrently
        const [inspections, structures, favoriteInspections, clients] =
          await Promise.all([
            fetchData("inspections", inspectionQuery),
            fetchData("structures", structuresQuery),
            fetchData("inspections", favoriteInspectionsQuery),
            fetchData("clients", ""),
          ]);

        // Update the state with the fetched data if it was successfully fetched
        if (inspections) setInspections(inspections);
        if (structures) setDateRanggStructures(structures);
        console.log(structures);
        if (favoriteInspections) {
          setFavoriteInspections(favoriteInspections);
          console.log(favoriteInspections);
        }
        if (clients) setClients(clients);
      }
    };

    // Call the fetch function
    fetchInspectionData();
  }, [session, inspectionQuery, startDate, endDate]); // The effect depends on `session` and `inspectionQuery`

  /**
   * Processes structure data and prepares it for charting.
   *
   * @param {Array} structureData - The structure data to process. Each element should be an object with an `attributes` property, which should be an object with `inspectionDate` and `type` properties.
   */
  const processStructureData = (structureData) => {
    // Initialize an empty object to store the counts of each type for each date
    const countsByTypeAndDate = {};

    // Initialize the minimum and maximum dates to the inspection date of the first structure
    let minDate = Infinity;
    let maxDate = -Infinity;

    // Iterate over each structure in the data
    structureData.forEach((structure) => {
      // Convert the inspection date to a timestamp
      const date = new Date(structure.attributes.inspectionDate).getTime();

      // Update the minimum and maximum dates if necessary
      minDate = Math.min(minDate, date);
      maxDate = Math.max(maxDate, date);

      // Get the type of the structure
      const type = structure.attributes.type;

      // Initialize the count object for this type if it doesn't exist yet
      countsByTypeAndDate[type] = countsByTypeAndDate[type] || {};

      // Increment the count for this type on this date
      countsByTypeAndDate[type][date] =
        (countsByTypeAndDate[type][date] || 0) + 1;
    });

    // Convert the counts into a series format suitable for ApexCharts
    const series = Object.entries(countsByTypeAndDate).map(([type, dates]) => {
      // Initialize an empty array to store the series data for this type
      const seriesData = [];

      // Iterate over each date in the range from the minimum to the maximum date
      for (let date = minDate; date <= maxDate; date += 24 * 60 * 60 * 1000) {
        // Add the count for this type on this date to the series data, or 0 if there is no count
        seriesData.push([date, dates[date] || 0]);
      }

      // Return the series data for this type, limited to the first 25 entries
      return { name: type, data: seriesData.slice(0, 25) };
    });

    // Update the chart series with the new data
    setChartSeries(series);
  };

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

  const groupedStructures = groupStructuresByType(dateRanggStructures);

  const allStructureTypes = Object.keys(groupedStructures).map((type) => {
    return {
      name: type,
      count: groupedStructures[type].length,
    };
    console.log(groupedStructures[type]);
  });

  return (
    <>
      <div className="grid grid-cols-1 my-4">
        <InspectionCreateDrawer />
      </div>

      {/* <div className="grid grid-cols-1 gap-4 mb-4 shadow-none">
        <div className="border-gray-300 rounded-lg dark:border-gray-600 bg-white p-0 shadow-none">
          <StructureTypesNumbers structures={allStructures} />
        </div>
      </div> */}

      <div className="flex flex-col gap-0 mb-4 shadow-none border border-gray-200 rounded-md overflow-hidden bg-white p-4 md:p-6">
        <div className="flex bg-white gap-6 justify-between">
          <div>
            <h3 className="text-xl font-bold dark:text-white mb-1">
              Structure Reports
            </h3>
            <h6 className="text-sm font-light text-gray-400">
              Filter and download
            </h6>
          </div>
          <div className="flex justify-between">
            {/* <h3 className="text-xl font-bold dark:text-white">Report</h3> */}
            <div className="flex gap-3">
              <Select
                className="w-52"
                onChange={(e) => setClientSelected(e.target.value)}
              >
                <option value={null}>All Clients</option>
                {clients.map((client, index) => (
                  <option key={index} value={client.id}>
                    {client.attributes.name}
                  </option>
                ))}
              </Select>
              <Select
                className="w-52"
                onChange={(e) => setAggregation(e.target.value)}
              >
                <option value={null}>Choose Aggregation</option>
                <option value={"day"}>Days</option>
                <option value={"month"}>Months</option>
              </Select>
              <Datepicker
                className="w-52"
                defaultDate={startDate}
                onSelectedDateChanged={(date) => setStartDate(date)}
              />
              <Datepicker
                className="w-52"
                defaultDate={endDate}
                onSelectedDateChanged={(date) => setEndDate(date)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 pt-6">
          <div className="col-span-3">
            <div className="w-full mt-auto">
              <div style={{ height: "400px" }}>
                <StructureGraph
                  structures={dateRanggStructures}
                  aggregation={aggregation}
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>
              {/* <StructureTypesNumbers structures={allStructures} /> */}
            </div>
          </div>
          <div className="flex flex-col justify-between col-span-1">
            <div
              className=" grid grid-cols-2 gap-4 overflow-scroll"
              style={{ maxHeight: "400px" }}
            >
              <div
                className={`flex col-span-2 rounded-lg px-7 gap-4 justify-center bg-white hover:bg-gray-50 border border-gray-300 h-32`}
              >
                <div className="flex w-14 h-14 rounded-full my-auto text-center bg-dark-blue-700">
                  <p className={`text-xl text-white m-auto text-center`}>
                    {dateRanggStructures.length}
                  </p>
                </div>
                <p className=" text-xs text-center font-semibold text-dark-blue-700 my-auto ">
                  Total Structures
                </p>
              </div>
              {allStructureTypes.map((type, index) => {
                const backgroundColor = colors[index];
                const lighterColor = lightenColor(backgroundColor, 40); // Adjust the percentage as needed

                return (
                  <div
                    className={`flex flex-col rounded-lg p-7 aspect-square bg-white hover:bg-gray-50 border border-gray-300`}
                    key={index}
                  >
                    <div
                      className="flex w-14 h-14 rounded-full m-auto text-center"
                      style={{ backgroundColor }}
                    >
                      <p className={`text-xl text-white m-auto text-center`}>
                        {type.count}
                      </p>
                    </div>
                    <p
                      className=" text-xs text-center font-semibold mt-2"
                      style={{ color: backgroundColor }}
                    >
                      {type.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {favoriteInspections.length > 0 && (
        <div className="flex flex-col gap-3 p-6 mb-4 bg-gray-50 border border-gray-200 rounded-md">
          <h3 className="text-xl font-bold dark:text-white">
            Favorite Inspections
          </h3>

          <div className="flex overflow-x-scroll hide-scroll-bar">
            <div className="flex flex-nowrap gap-3">
              {favoriteInspections.map((inspection, index) => (
                <FavoriteInspectionCard key={index} inspection={inspection} />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 mb-4 shadow-none">
        <div className="border-gray-300 rounded-lg dark:border-gray-600 bg-white p-0 shadow-none">
          <InspectionTable inspectionData={inspections} />
        </div>
      </div>
    </>
  );
}
