"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import qs from "qs";
import { getAllTeams } from "../../utils/api/teams";
import { off } from "process";
import Link from "next/link";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });
const MapboxMap = dynamic(() => import("../../components/MapBox"), {
  ssr: false,
});

export default function Page({ params }) {
  const { data: session } = useSession();
  const [teams, setTeams] = useState([]);

  const today = new Date().toISOString().split("T")[0];

  console.log(today);
  console.log(typeof today);

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

    fetchTeams();
  }, [session]);

  const ProgressCard = ({ team }) => {
    const structures = team.attributes.structures.data || [];
    const totalStructures = structures.length;

    const totalInspectedStructures = structures.filter(
      (structure) => structure.attributes.status === "Inspected"
    ).length;

    const progress = totalStructures
      ? (totalInspectedStructures / totalStructures) * 100
      : 0;

    const chartOptions = {
      chart: {
        type: "radialBar",
        offsetY: -9,
      },
      plotOptions: {
        radialBar: {
          hollow: {
            size: "70%",
          },
        },
      },
      labels: [team.attributes.name],
    };

    return (
      <Link href={`/schedules/${team.attributes.name}`}>
        <div className="bg-white shadow-sm rounded-lg p-6 aspect-square overflow-hidden">
          {/* <h2 className="text-xl font-bold mb-4">{team.attributes.name}</h2> */}
          <div className="flex justify-center items-center">
            <ApexChart
              type="radialBar"
              options={chartOptions}
              series={[progress]}
              height={270}
              width={270}
            />
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="flex gap-4 flex-col justify-between py-6">
      <section className="grid grid-cols-5 p-0 rounded-md gap-4">
        <h5 class="text-xl font-bold dark:text-white mb-3">
          Today's Schedules
        </h5>
      </section>
      <section className="grid grid-cols-5 p-0 rounded-md gap-4">
        {teams.map((team, index) => (
          <ProgressCard key={index} team={team} />
        ))}
      </section>
    </div>
  );
}
