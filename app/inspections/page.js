"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Button, Timeline, Navbar } from "flowbite-react";
import { HiArrowNarrowRight, HiCalendar } from "react-icons/hi";
import axios from "axios";
import InspectionTable from "../../components/InspectionTable";
import InspectionModal from "../../components/Modals/InspectionModal";
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
              `http://localhost:1337/api/inspections?${inspectionQuery}`,
              {
                headers: { Authorization: `Bearer ${session.accessToken}` },
              }
            ),
            axios.get(`http://localhost:1337/api/structures`, {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 mb-4">
        <div className="flex items-center border-gray-300 rounded-lg dark:border-gray-600 bg-white p-8">
          <div className="w-full">
            <InspectionModal />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="flex items-center border-gray-300 rounded-lg dark:border-gray-600 h-32 md:h-32 bg-white p-8">
          <div className="w-full">
            <div className="flex items-end justify-between mt-1 mb-4">
              <div className="text-gray-600 text-sm uppercase">Revenue</div>
              <div className="text-sm text-green-500 font-semibold ml-2">
                +4.75%
              </div>
            </div>
            <div className="max-w-lg text-2xl font-semibold">$405,091.00</div>
          </div>
        </div>
        <div className="flex items-center rounded-lg border-gray-300 dark:border-gray-600 h-32 md:h-32 bg-white p-8">
          <div className="w-full">
            <div className="flex items-end justify-between mt-1 mb-4">
              <div className="text-gray-600 text-sm uppercase">Revenue</div>
              <div className="text-sm text-green-500 font-semibold ml-2">
                +4.75%
              </div>
            </div>
            <div className="max-w-lg text-2xl font-semibold">$405,091.00</div>
          </div>
        </div>
        <div className="flex items-center rounded-lg border-gray-300 dark:border-gray-600 h-32 md:h-32 bg-white p-8">
          <div className="w-full">
            <div className="flex items-end justify-between mt-1 mb-4">
              <div className="text-gray-600 text-sm uppercase">Revenue</div>
              <div className="text-sm text-green-500 font-semibold ml-2">
                +4.75%
              </div>
            </div>
            <div className="max-w-lg text-2xl font-semibold">$405,091.00</div>
          </div>
        </div>
        <div className="flex items-center rounded-lg border-gray-300 dark:border-gray-600 h-32 md:h-32 bg-white p-8">
          <div className="w-full">
            <div className="flex items-end justify-between mt-1 mb-4">
              <div className="text-gray-600 text-sm uppercase">Revenue</div>
              <div className="text-sm text-green-500 font-semibold ml-2">
                +4.75%
              </div>
            </div>
            <div className="max-w-lg text-2xl font-semibold">$405,091.00</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div className="flex col-span-2 items-center border-gray-300 rounded-lg dark:border-gray-600 bg-white p-8">
          <div className="w-full">
            <ApexChart
              type="area"
              options={option}
              series={chartSeries}
              height={384}
              width={"100%"}
            />
          </div>
        </div>
        <div className="flex items-center rounded-lg border-gray-300 dark:border-gray-600 bg-white p-8">
          <Timeline className="im-snapping overflow-x-visible overflow-y-scroll h-96 pr-2">
            <Timeline.Item>
              <Timeline.Point />
              <Timeline.Content>
                <Timeline.Time>February 2022</Timeline.Time>
                <Timeline.Title>
                  Application UI code in Tailwind CSS
                </Timeline.Title>
                <Timeline.Body>
                  Get access to over 20+ pages including a dashboard layout,
                  charts, kanban board, calendar, and pre-order E-commerce &
                  Marketing pages.
                </Timeline.Body>
                <Button color="gray">
                  Learn More
                  <HiArrowNarrowRight className="ml-2 h-3 w-3" />
                </Button>
              </Timeline.Content>
            </Timeline.Item>
            <Timeline.Item>
              <Timeline.Point />
              <Timeline.Content>
                <Timeline.Time>March 2022</Timeline.Time>
                <Timeline.Title>Marketing UI design in Figma</Timeline.Title>
                <Timeline.Body>
                  All of the pages and components are first designed in Figma
                  and we keep a parity between the two versions even as we
                  update the project.
                </Timeline.Body>
              </Timeline.Content>
            </Timeline.Item>
            <Timeline.Item>
              <Timeline.Point />
              <Timeline.Content>
                <Timeline.Time>April 2022</Timeline.Time>
                <Timeline.Title>
                  E-Commerce UI code in Tailwind CSS
                </Timeline.Title>
                <Timeline.Body>
                  Get started with dozens of web components and interactive
                  elements built on top of Tailwind CSS.
                </Timeline.Body>
              </Timeline.Content>
            </Timeline.Item>
            <Timeline.Item>
              <Timeline.Point />
              <Timeline.Content>
                <Timeline.Time>April 2022</Timeline.Time>
                <Timeline.Title>
                  E-Commerce UI code in Tailwind CSS
                </Timeline.Title>
                <Timeline.Body>
                  Get started with dozens of web components and interactive
                  elements built on top of Tailwind CSS.
                </Timeline.Body>
              </Timeline.Content>
            </Timeline.Item>
            <Timeline.Item>
              <Timeline.Point />
              <Timeline.Content>
                <Timeline.Time>April 2022</Timeline.Time>
                <Timeline.Title>
                  E-Commerce UI code in Tailwind CSS
                </Timeline.Title>
                <Timeline.Body>
                  Get started with dozens of web components and interactive
                  elements built on top of Tailwind CSS.
                </Timeline.Body>
              </Timeline.Content>
            </Timeline.Item>
            <Timeline.Item>
              <Timeline.Point />
              <Timeline.Content>
                <Timeline.Time>April 2022</Timeline.Time>
                <Timeline.Title>
                  E-Commerce UI code in Tailwind CSS
                </Timeline.Title>
                <Timeline.Body>
                  Get started with dozens of web components and interactive
                  elements built on top of Tailwind CSS.
                </Timeline.Body>
              </Timeline.Content>
            </Timeline.Item>
            <Timeline.Item>
              <Timeline.Point />
              <Timeline.Content>
                <Timeline.Time>April 2022</Timeline.Time>
                <Timeline.Title>
                  E-Commerce UI code in Tailwind CSS
                </Timeline.Title>
                <Timeline.Body>
                  Get started with dozens of web components and interactive
                  elements built on top of Tailwind CSS.
                </Timeline.Body>
              </Timeline.Content>
            </Timeline.Item>
          </Timeline>
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
