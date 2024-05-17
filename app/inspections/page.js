"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Button, Progress, Select } from "flowbite-react";
import { HiArrowNarrowRight, HiCalendar } from "react-icons/hi";
import axios from "axios";
import InspectionTable from "../../components/InspectionTable";
import InspectionModal from "../../components/Modals/InspectionModal";
import InspectionDrawer from "../../components/Drawers/InspectionDrawer";
import FavoriteInspectionCard from "../../components/Cards/FavoriteInspectionCard";
import ActivityLog from "../../components/ActivityLog";
import { GoPlus } from "react-icons/go";
import qs from "qs";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function Dashboard() {
  const { data: session } = useSession();
  const [inspections, setInspections] = useState([]);
  const [favoriteInspections, setFavoriteInspections] = useState([]);
  const [chartSeries, setChartSeries] = useState([]);

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
        const [inspections, structures, favoriteInspections] =
          await Promise.all([
            fetchData("inspections", inspectionQuery),
            fetchData("structures", ""),
            fetchData("inspections", favoriteInspectionsQuery),
          ]);

        // Update the state with the fetched data if it was successfully fetched
        if (inspections) setInspections(inspections);
        if (structures) processStructureData(structures);
        if (favoriteInspections) {
          setFavoriteInspections(favoriteInspections);
          console.log(favoriteInspections);
        }
      }
    };

    // Call the fetch function
    fetchInspectionData();
  }, [session, inspectionQuery]); // The effect depends on `session` and `inspectionQuery`

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

  return (
    <>
      <div className="grid grid-cols-1 my-4">
        <InspectionDrawer />
      </div>

      <div className="flex overflow-x-scroll mb-4 hide-scroll-bar py-2">
        <div className="flex flex-nowrap gap-3">
          {favoriteInspections.map((inspection, index) => (
            <FavoriteInspectionCard key={index} inspection={inspection} />
          ))}

          <div className="flex flex-col justify-center align-middle gap-1 w-80 max-w-xs overflow-hidden rounded-lg bg-gray-100 border shadow p-6 hover:shadow-lg hover:bg-gray-50 transition-all duration-100 ease-in-out cursor-pointer">
            <GoPlus className="text-center mx-auto" />
            <p className="text-center">Add Favorite</p>
          </div>
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
