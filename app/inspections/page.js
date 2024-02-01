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
import qs from "qs";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function Dashboard() {
  const { data: session } = useSession();
  const [inspections, setInspections] = useState([]);
  const [chartSeries, setChartSeries] = useState([]);

  const option = {
    chart: {
      id: "apexchart-example",
      width: "100%",
      type: "area",
      stroke: {
        curve: "smooth",
      },
    },
    xaxis: {
      type: "datetime",
    },

    yaxis: {
      min: 0,
    },
  };

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
    },
  });

  const structureQuery = qs.stringify({
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
    const fetchInspectionData = async () => {
      if (session?.accessToken) {
        try {
          const [inspectionResponse, structureResponse] = await Promise.all([
            axios.get(
              `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/inspections?${inspectionQuery}`,
              {
                headers: { Authorization: `Bearer ${session.accessToken}` },
              }
            ),
            axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/structures`, {
              headers: { Authorization: `Bearer ${session.accessToken}` },
            }),
          ]);

          setInspections(inspectionResponse.data.data);
          processStructureData(structureResponse.data.data);
        } catch (error) {
          console.error("Error fetching data", error.response || error);
        }
      }
    };

    fetchInspectionData();
  }, [session, inspectionQuery]);

  const processStructureData = (structureData) => {
    console.log(structureData.length);

    // Use objects to track counts and to find the date range
    const countsByTypeAndDate = {};
    let minDate = new Date(structureData[0].attributes.inspectionDate);
    let maxDate = new Date(structureData[0].attributes.inspectionDate);

    structureData.forEach((structure) => {
      const date = new Date(structure.attributes.inspectionDate);
      minDate = date < minDate ? date : minDate;
      maxDate = date > maxDate ? date : maxDate;

      const dateString = date.toISOString().split("T")[0];
      const type = structure.attributes.type;

      if (!countsByTypeAndDate[type]) {
        countsByTypeAndDate[type] = {};
      }

      if (!countsByTypeAndDate[type][dateString]) {
        countsByTypeAndDate[type][dateString] = 0;
      }

      countsByTypeAndDate[type][dateString]++;
    });

    // Fill in missing dates with zero counts
    for (const type in countsByTypeAndDate) {
      for (
        let d = new Date(minDate);
        d <= maxDate;
        d.setDate(d.getDate() + 1)
      ) {
        const dateString = d.toISOString().split("T")[0];
        if (!countsByTypeAndDate[type][dateString]) {
          countsByTypeAndDate[type][dateString] = 0;
        }
      }
    }

    // Convert the object into a series format expected by ApexCharts
    const series = Object.entries(countsByTypeAndDate).map(([type, dates]) => {
      const seriesData = Object.entries(dates).map(([dateString, count]) => {
        return [new Date(dateString).getTime(), count];
      });

      seriesData.sort((a, b) => a[0] - b[0]);
      return { name: type, data: seriesData.slice(0, 25) };
    });

    setChartSeries(series);
  };

  return (
    <>
      <div className="grid grid-cols-1 my-4">
        <InspectionDrawer />
      </div>

      <div className="flex overflow-x-scroll mb-4 hide-scroll-bar">
        <div className="flex flex-nowrap gap-3">
          <FavoriteInspectionCard />
          <FavoriteInspectionCard />
          <FavoriteInspectionCard />
          <FavoriteInspectionCard />
          <FavoriteInspectionCard />
          <FavoriteInspectionCard />
          <FavoriteInspectionCard />
          <FavoriteInspectionCard />
          <FavoriteInspectionCard />
          <FavoriteInspectionCard />
          <FavoriteInspectionCard />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-4 shadow-none">
        <div className="border-gray-300 rounded-lg dark:border-gray-600 bg-white p-0 shadow-none">
          <InspectionTable inspectionData={inspections} />
        </div>
      </div>

      <div className="grid grid-cols-1 mb-4">
        <ActivityLog />
      </div>
    </>
  );
}
