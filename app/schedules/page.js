"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import qs from "qs";
import { getAllTeams } from "../../utils/api/teams";
import { getAllStructure } from "../../utils/api/structures";
import Link from "next/link";
import DirectionsComponent from "../../components/DirectionsComponent";
import { useRouter } from "next/navigation";
import StructureTypesNumbers from "../../components/StructureTypesNumbers";
import { Button, Progress } from "flowbite-react";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });
const MapboxMap = dynamic(() => import("../../components/MapBox"), {
  ssr: false,
});

const iconMap = {
  red: "/location-red.png",
  yellow: "/location-yellow.png",
  drkgreen: "/location-dark.png",
  green: "/location-green.png",
};

const loadIcon = (color) => iconMap[color] || "/location-red.png";

const getColorBasedOnStatus = (status) => {
  switch (status.toLowerCase()) {
    case "uploaded":
      return "drkgreen";
    case "inspected":
      return "green";
    case "not inspected":
      return "yellow";
    default:
      return "red";
  }
};

const getInspectionColor = (status) => {
  switch (status.toLowerCase()) {
    case "uploaded":
      return "text-white bg-green-800";
    case "inspected":
      return "text-green-800 bg-green-100";
    case "not inspected":
      return "text-yellow-800 bg-yellow-100";
    default:
      return "text-red-800 bg-red-100";
  }
};

function convertToLongDateFormat(dateString) {
  // Create a Date object from the input date string
  const dateObject = new Date(dateString);

  // Format the date object to "Month Day, Year" format
  const options = { year: "numeric", month: "long", day: "numeric" };
  const formattedDate = new Intl.DateTimeFormat("en-US", options).format(
    dateObject
  );

  return formattedDate;
}

const ProgressCard = ({ team, totalStructures, inspectedCount }) => {
  const router = useRouter();

  const progress = totalStructures
    ? (inspectedCount / totalStructures) * 100
    : 0;

  return (
    <div
      className="bg-white hover:bg-gray-50 rounded-lg p-5 aspect-video overflow-hidden border cursor-pointer flex flex-col justify-between"
      onClick={() => router.push(`/schedules/${team.id}`)}
    >
      <div className="flex flex-col gap-2">
        <h4 className="leading-none font-medium text-md">
          {team.attributes.name}
        </h4>
        <div className="flex gap-3">
          <p className="text-xs">{totalStructures} Total</p>
          <p className="text-xs">
            {totalStructures - inspectedCount} Remaining
          </p>
        </div>
      </div>
      {totalStructures > 0 && (
        <Progress progress={progress} textLabel="" size="md" color="blue" />
      )}
    </div>
  );
};

export default function Page({ params }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [structures, setStructures] = useState([]);
  const [date, setDate] = useState(
    new Date(convertToLongDateFormat(new Date()))
  );

  const today = new Date().toISOString().split("T")[0];

  const teamsQuery = "";

  const structureQuery = qs.stringify(
    {
      fields: [
        "mapSection",
        "type",
        "status",
        "adminStatus",
        "longitude",
        "latitude",
      ],
      filters: {
        $and: [
          {
            scheduleStart: {
              $lte: today, // scheduleStart should be on or before today
            },
          },
          {
            scheduleEnd: {
              $gte: today, // scheduleEnd should be on or after today
            },
          },
        ],
      },
      populate: {
        team: {
          fields: ["name"],
        },
        inspection: {
          fields: ["name"],
        },
      },
    },
    {
      encodeValuesOnly: true, // This prevents the keys from being URL-encoded
    }
  );

  useEffect(() => {
    if (!session) return;

    const getPageData = async () => {
      try {
        const [teams, structures] = await Promise.all([
          getAllTeams({ jwt: session.accessToken, query: teamsQuery }),
          getAllStructure({ jwt: session.accessToken, query: structureQuery }),
        ]);

        console.log(teams.data.data);
        console.log(structures);

        setTeams(teams.data.data);
        setStructures(structures);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    getPageData();
  }, [session]);

  // Precompute team structures mapping
  const teamStructuresMap = useMemo(() => {
    const map = {};
    structures.forEach((structure) => {
      const teamId = structure.attributes.team.data.id;
      if (!map[teamId]) {
        map[teamId] = { total: 0, inspected: 0 };
      }
      map[teamId].total += 1;
      if (structure.attributes.status === "Inspected") {
        map[teamId].inspected += 1;
      }
    });
    return map;
  }, [structures]);

  const scheduledTeams = useMemo(
    () => teams.filter((team) => teamStructuresMap[team.id]?.total > 0),
    [teams, teamStructuresMap]
  );

  const notScheduledTeams = useMemo(
    () => teams.filter((team) => !teamStructuresMap[team.id]?.total),
    [teams, teamStructuresMap]
  );

  return (
    <div className="flex gap-4 flex-col justify-between py-6">
      <section className="grid grid-col md:grid-cols-8 p-0 rounded-md gap-4">
        <div className="flex flex-col col-span-5 gap-3">
          <div className="shadow-sm border-gray-400 bg-slate-50 p-4 md:p-6 rounded-lg w-full h-full">
            <h5 className="text-xl font-bold dark:text-white mb-3">Teams</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scheduledTeams.map((team, index) => (
                <ProgressCard
                  key={index}
                  team={team}
                  totalStructures={teamStructuresMap[team.id].total}
                  inspectedCount={teamStructuresMap[team.id].inspected}
                  showEmpty={false}
                />
              ))}
            </div>

            <h6 className=" text-xs text-gray-400 border-b border-gray-300 mt-6 mb-4 pb-2">
              Not Scheduled Teams
            </h6>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {notScheduledTeams.map((team, index) => (
                <ProgressCard
                  key={index}
                  team={team}
                  totalStructures={0}
                  inspectedCount={0}
                  showEmpty={false}
                />
              ))}
            </div>
          </div>
          <StructureTypesNumbers structures={structures} />
        </div>

        <div className="col-span-5 md:col-span-3 bg-white shadow-sm gap-4 p-4 md:p-6 rounded-lg">
          <h5 className="text-xl font-bold dark:text-white mb-3">
            Todays Structures
          </h5>
          <div className="flex flex-col justify-between gap-6 h-fit1 md:h-[700px]">
            <div className="im-snapping overflow-scroll w-full h-full">
              {structures.map((structure, index) => (
                <div
                  key={`${structure.id}-${index}`}
                  className="flex flex-row cursor-pointer justify-between items-center bg-white border-0 border-b-2 border-gray-100 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 py-4 mb-0 w-full"
                  onClick={() => {
                    router.push(
                      `/inspections/${structure.attributes.inspection.data.id}?structure=${structure.id}`
                    );
                  }}
                >
                  <div className="flex">
                    <img
                      src={loadIcon(
                        getColorBasedOnStatus(structure.attributes.status)
                      )}
                      style={{ height: 27 }}
                    />
                    <div className="flex flex-col justify-between pt-0 pb-0 pl-4 pr-4 leading-normal">
                      <h5 className="flex flex-shrink-0 mb-1 text-sm font-bold tracking-tight text-gray-900 dark:text-white">
                        {structure.attributes.mapSection}
                        <span className="flex items-center font-light ml-1">
                          {` / ${structure.attributes.type}`}
                        </span>
                      </h5>
                      <DirectionsComponent />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <p className="flex text-sm text-gray-700 dark:text-gray-400">
                      <span
                        className={`${getInspectionColor(
                          structure.attributes.status
                        )} flex align-middle text-xs font-medium me-2 px-2.5 py-0.5 gap-2 rounded-full`}
                      >
                        {structure.attributes.status}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
