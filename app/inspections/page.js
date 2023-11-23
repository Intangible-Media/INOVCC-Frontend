"use client";
// Remember you must use an AuthProvider for
// client components to useSession
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Button, Timeline, Navbar } from "flowbite-react";
import { HiArrowNarrowRight, HiCalendar } from "react-icons/hi";
import axios from "axios";
import InspectionTable from "../../components/InspectionTable";
import qs from "qs";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function dashboard() {
  const { data: session, loading } = useSession();
  const [inspections, setInspections] = useState([]);

  const option = {
    chart: {
      id: "apexchart-example",
      width: "100%",
    },
    xaxis: {
      categories: [
        "January",
        "Febuary",
        "March",
        "April",
        "Map",
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

  const series = [
    {
      name: "Wood Poles",
      data: [30, 40, 35, 50, 49, 60, 70, 91, 125, 30, 40, 35],
    },
    {
      name: "Street Lights",
      data: [40, 20, 75, 50, 109, 50, 70, 91, 12, 80, 70, 65],
    },
    {
      name: "Standard Vaults",
      data: [80, 80, 25, 60, 139, 10, 30, 151, 152, 85, 30, 95],
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
            `http://localhost:1337/api/inspections?${query}`,
            {
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
              },
            }
          );
          console.log(response.data.data);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 mb-4">
        <div className="flex items-center border-gray-300 rounded-lg dark:border-gray-600 bg-white p-8">
          <div className="w-full"></div>
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
              type="bar"
              options={option}
              series={series}
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
