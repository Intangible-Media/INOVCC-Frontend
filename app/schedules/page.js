"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import qs from "qs";
import { getAllTeams } from "../../utils/api/teams";
import { getAllStructure } from "../../utils/api/structures";
import { off } from "process";
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

export default function Page({ params }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [structures, setStructures] = useState([]);
  const [date, setDate] = useState(
    new Date(convertToLongDateFormat(new Date()))
  );

  const today = new Date().toISOString().split("T")[0];

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

  const structureQuery = qs.stringify(
    {
      filters: {
        scheduleForInspection: {
          $eq: date,
        },
      },
      populate: {
        team: {
          fields: ["name"],
        },
        inspection: {
          fields: ["name"],
        },
        images: {
          populate: "*",
        },
      },
    },
    {
      encodeValuesOnly: true,
    }
  );

  useEffect(() => {
    if (!session) return;

    const fetchTeams = async () => {
      const teams = await getAllTeams({
        jwt: session.accessToken,
        query: teamsQuery,
      });
      console.log(teams.data.data);
      setTeams(teams.data.data);
    };

    const fetchStructures = async () => {
      const structures = await getAllStructure({
        jwt: session.accessToken,
        query: structureQuery,
      });
      console.log(structures.data.data);
      setStructures(structures.data.data);
    };

    fetchTeams();
    fetchStructures();
  }, [session]);

  const ProgressCard = ({ team }) => {
    const router = useRouter();

    // const structures = team.attributes.structures.data || [];

    const totalTeamStructures = structures.filter(
      (structure) => structure.attributes.team.data.id === team.id
    );

    const teamScheduledStructuresInspected = structures.filter((structure) => {
      if (
        structure.attributes.team.data.id === team.id &&
        structure.attributes.status === "Inspected"
      ) {
        return structure;
      }
    });

    const teamScheduledStructuresNotInspected = structures.filter(
      (structure) => {
        if (
          structure.attributes.team.data.id === team.id &&
          structure.attributes.status !== "Inspected"
        ) {
          return structure;
        }
      }
    );

    const progress = totalTeamStructures.length
      ? (teamScheduledStructuresInspected.length / totalTeamStructures.length) *
        100
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
            <p className=" text-xs">{totalTeamStructures.length} Total</p>
            <p className=" text-xs">
              {teamScheduledStructuresNotInspected.length} Remaining
            </p>
          </div>
        </div>
        {totalTeamStructures.length > 0 && (
          <Progress progress={progress} textLabel="" size="md" color="blue" />
        )}
      </div>
    );
  };

  return (
    <div className="flex gap-4 flex-col justify-between py-6">
      {/* <section className="grid grid-cols-1">
        <Button className="bg-dark-blue-700 text-white w-full shrink-0 self-start">
          <p className="mr-3">{"Schedule Structure"}</p>
        </Button>
      </section> */}

      <section className="grid grid-col md:grid-cols-8 p-0 rounded-md gap-4">
        <div className="flex flex-col col-span-5 gap-3">
          <div className="shadow-sm border-gray-400 bg-slate-50 p-4 md:p-6 rounded-lg w-full h-full">
            <h5 className="text-xl font-bold dark:text-white mb-3">Teams</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {teams.map((team, index) => {
                const teamScheduledStructures = structures.filter(
                  (structure) => {
                    return structure.attributes.team.data.id === team.id;
                  }
                );

                if (teamScheduledStructures.length > 0) {
                  return (
                    <ProgressCard key={index} team={team} showEmpty={false} />
                  );
                }
              })}
            </div>

            <h6 className=" text-xs text-gray-400 border-b border-gray-300 mt-6 mb-4 pb-2">
              Not Scheduled Teams
            </h6>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {teams.map((team, index) => {
                const teamScheduledStructures = structures.filter(
                  (structure) => {
                    return structure.attributes.team.data.id === team.id;
                  }
                );

                if (teamScheduledStructures.length === 0) {
                  return (
                    <ProgressCard key={index} team={team} showEmpty={false} />
                  );
                }
              })}
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

                    {/* <EditIcon /> */}
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
