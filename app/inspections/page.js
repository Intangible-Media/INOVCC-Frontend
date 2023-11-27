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
    },
    xaxis: {
      categories: [
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
      ],
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

          console.log(structureResponse.data.data);

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
    const structureCountsByMonth = structureData.reduce((acc, structure) => {
      const month = new Date(structure.attributes.inspectionDate).getMonth();
      const type = structure.attributes.type;

      if (!acc[type]) {
        acc[type] = Array(12).fill(0);
      }

      acc[type][month]++;
      return acc;
    }, {});

    const series = Object.entries(structureCountsByMonth).map(
      ([name, data]) => ({
        name,
        data,
      })
    );

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
