import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import qs from "qs";
import { getAllTeams } from "../../utils/api/teams";
import { getAllStructure, fetchAllStructure } from "../../utils/api/structures";
import ProgressCard from "../../components/Cards/Progress";
import { useSession } from "next-auth/react";
import StructureTypesNumbers from "../../components/StructureTypesNumbers";

export default async function Page({ params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <p>You must be logged in to view this page.</p>;
  }

  console.log(session?.accessToken);

  //console.log(session);
  const today = new Date().toISOString().split("T")[0];

  const teamsQuery = "";

  const structureScheduled = qs.stringify(
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
            status: {
              $eq: "Inspected",
            },
          },
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

  const structures = await fetchAllStructure({
    jwt: session?.accessToken,
    query: structureQuery,
  });

  // Create a map to store team progress data
  const teamStructuresMap = {};

  structures.data.forEach((structure) => {
    const team = structure.attributes.team.data;
    const teamId = team.id;
    const status = structure.attributes.status;

    if (!teamStructuresMap[teamId]) {
      teamStructuresMap[teamId] = {
        team: { id: teamId, attributes: { name: team.attributes.name } },
        total: 0,
        inspected: 0,
      };
    }

    teamStructuresMap[teamId].total += 1;

    if (status === "Inspected") {
      teamStructuresMap[teamId].inspected += 1;
    }
  });

  const scheduledTeams = Object.values(teamStructuresMap);

  return (
    <div className="flex gap-4 flex-col justify-between py-6">
      <section className="grid grid-col md:grid-cols-8 p-0 rounded-md gap-4">
        <div className="flex flex-col col-span-8 gap-3">
          <div className="shadow-sm border-gray-400 bg-slate-50 p-4 md:p-6 rounded-lg w-full h-full">
            <h5 className="text-xl font-bold dark:text-white mb-3">Teams</h5>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {scheduledTeams.map((teamData, index) => (
                <ProgressCard
                  key={index}
                  team={teamData.team}
                  totalStructures={teamData.total}
                  inspectedCount={teamData.inspected}
                />
              ))}
            </div>

            <h6 className=" text-xs text-gray-400 border-b border-gray-300 mt-6 mb-4 pb-2">
              Not Scheduled Teams
            </h6>
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {notScheduledTeams.map((team, index) => (
                <Progress
                  key={index}
                  team={team}
                  totalStructures={0}
                  inspectedCount={0}
                  showEmpty={false}
                />
              ))}
            </div> */}
          </div>
          <StructureTypesNumbers structures={structures.data} />
        </div>
      </section>
    </div>
  );
}
