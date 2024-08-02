"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
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
import ProtectedContent from "../../components/ProtectedContent";
import { SearchIconSmWhite } from "../../public/icons/intangible-icons";
import { getAllStructure } from "../../utils/api/structures";
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
        fields: ["status", "inspectionDate", "type"],
      },
      client: {
        populate: {
          fields: ["name"],
        },
      },
    },
  });

  const formattedStartDate = startDate.toISOString();
  const formattedEndDate = endDate.toISOString();

  const structuresQuery = qs.stringify({
    field: ["mapSection"],
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

  const fetchData = useCallback(
    async (url, query) => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/${url}?${query}`,
          {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          }
        );
        return response.data.data;
      } catch (error) {
        console.error(`Error fetching ${url}`, error.response || error);
        return null;
      }
    },
    [session?.accessToken]
  );

  useEffect(() => {
    const fetchInspectionData = async () => {
      if (!session) return;

      //const inspections = await fetchData("inspections", inspectionQuery);
      const apiParams = {
        jwt: session.accessToken,
        query: structuresQuery,
      };
      // const structures = await getAllStructure(apiParams);

      // const favoriteInspections = await fetchData(
      //   "inspections",
      //   favoriteInspectionsQuery
      // );
      // const clients = await fetchData("clients", "");

      const [inspections, structures, favoriteInspections, clients] =
        await Promise.all([
          fetchData("inspections", inspectionQuery, session.accessToken),
          getAllStructure(apiParams),
          fetchData(
            "inspections",
            favoriteInspectionsQuery,
            session.accessToken
          ),
          fetchData("clients", "", session.accessToken),
        ]);

      if (inspections) setInspections(inspections);
      if (structures) setDateRanggStructures(structures);
      if (favoriteInspections) setFavoriteInspections(favoriteInspections);
      if (clients) setClients(clients);
    };

    fetchInspectionData();
  }, [session, inspectionQuery, startDate, endDate, fetchData]);

  const processStructureData = (structureData) => {
    const countsByTypeAndDate = {};

    let minDate = Infinity;
    let maxDate = -Infinity;

    structureData.forEach((structure) => {
      const date = new Date(structure.attributes.inspectionDate).getTime();
      minDate = Math.min(minDate, date);
      maxDate = Math.max(maxDate, date);

      const type = structure.attributes.type;
      countsByTypeAndDate[type] = countsByTypeAndDate[type] || {};
      countsByTypeAndDate[type][date] =
        (countsByTypeAndDate[type][date] || 0) + 1;
    });

    const series = Object.entries(countsByTypeAndDate).map(([type, dates]) => {
      const seriesData = [];
      for (let date = minDate; date <= maxDate; date += 24 * 60 * 60 * 1000) {
        seriesData.push([date, dates[date] || 0]);
      }
      return { name: type, data: seriesData.slice(0, 25) };
    });

    setChartSeries(series);
  };

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
  });

  return (
    <>
      <div className="grid grid-cols-1 my-4">
        <InspectionCreateDrawer />
      </div>

      <ProtectedContent requiredRoles={["Admin"]}>
        <div className="flex flex-col gap-0 mb-4 shadow-none border border-gray-200 rounded-md overflow-hidden bg-white p-4 md:p-6">
          <div className="flex flex-col md:flex-row bg-white gap-6 justify-between">
            <div>
              <h3 className="text-xl font-bold dark:text-white mb-1">
                Structure Reports
              </h3>
              <h6 className="text-sm font-light text-gray-400">
                Filter and download
              </h6>
            </div>
            <div className="flex justify-between">
              <div className="hidden md:flex flex-col w-full md:flex-row gap-3">
                <Select
                  className="w-full md:w-52"
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
                  className="w-full md:w-52"
                  onChange={(e) => setAggregation(e.target.value)}
                >
                  <option value={null}>Choose Aggregation</option>
                  <option value={"day"}>Days</option>
                  <option value={"month"}>Months</option>
                </Select>
                <Datepicker
                  className="w-full md:w-52"
                  defaultDate={startDate}
                  onSelectedDateChanged={(date) => setStartDate(date)}
                />
                <Datepicker
                  className="w-full md:w-52"
                  defaultDate={endDate}
                  onSelectedDateChanged={(date) => setEndDate(date)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 md:pt-6">
            <div className="col-span-4 md:col-span-3">
              <div className="w-full mt-auto">
                <div className="overflow-x-auto overflow-y-hidden">
                  <StructureGraph
                    structures={dateRanggStructures}
                    aggregation={aggregation}
                    startDate={startDate}
                    endDate={endDate}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-between col-span-4 md:col-span-1">
              <div className=" grid grid-cols-2 gap-4 overflow-scroll max-h-[250px] md:max-h-[400px]">
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
                  const lighterColor = lightenColor(backgroundColor, 40);

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
      </ProtectedContent>

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
