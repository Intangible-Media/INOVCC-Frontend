import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/auth";
import qs from "qs";
import { statusColors } from "../../../utils/collectionListAttributes";
import { fetchAllStructure } from "../../../utils/api/structures";
import { getTeam } from "../../../utils/api/teams";
import { redirect } from "next/navigation";
import {
  sortStructuresByStatus,
  formatToReadableTime,
} from "../../../utils/strings";
import dynamic from "next/dynamic";
import InspectedStructuresTable from "../../../components/Tables/InspectedStructuresTable";
import MapTabsDropdowns from "../../../components/MapTabsDropdowns";
import StructuresInspectedHeatmap from "../../../components/Charts/StructuresInspectedHeatmap";
import ScheduleDate from "../../../components/ScheduleDate";
const MapboxMap = dynamic(() => import("../../../components/MapBox"), {
  ssr: false, // or ssr: false, depending on your needs
  loading: () => <Loading />, // Provide the loading component here
});

const Loading = () => (
  <div className="flex justify-center items-center h-full">
    <div className="loader">Loading Map...</div>
  </div>
);

export default async function Page({ params, searchParams }) {
  const session = await getServerSession(authOptions);
  let date;

  if (searchParams?.date) {
    const parsedDate = new Date(decodeURI(searchParams.date));

    // Check if the parsed date is valid
    if (!isNaN(parsedDate.getTime())) {
      date = parsedDate;
    } else {
      date = new Date(); // Fallback to today's date if the date is invalid
    }
  } else {
    date = new Date(); // Fallback to today's date if no date is provided
  }

  if (!session) return <p>You must be logged in to view this page.</p>;

  const structuresQuery = qs.stringify(
    {
      filters: {
        $and: [
          {
            team: {
              id: {
                $eq: params.id,
              },
            },
          },
          {
            scheduleStart: {
              $lte: date,
            },
          },
          {
            scheduleEnd: {
              $gte: date,
            },
          },
        ],
      },
      populate: {
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

  const team = await getTeam({
    jwt: session.accessToken,
    id: params.id,
    query: "",
  });

  const structures = await fetchAllStructure({
    jwt: session.accessToken,
    query: structuresQuery,
  });

  const groupedByInspectionId = structures.data.reduce((acc, structure) => {
    const inspectionId = structure.attributes.inspection.data.id;
    const mapName = structure.attributes.inspection.data.attributes.name;
    if (!acc[inspectionId]) {
      acc[inspectionId] = { mapName, structures: [] };
    }
    acc[inspectionId].structures.push(structure);
    return acc;
  }, {});

  const groupedArray = Object.keys(groupedByInspectionId).map((key) => ({
    inspectionId: key,
    mapName: groupedByInspectionId[key].mapName,
    structures: sortStructuresByStatus(groupedByInspectionId[key].structures),
  }));

  const structuresInspectedToday = structures.data.filter((structure) => {
    const { status, inspectionDate } = structure.attributes;

    if (status === "Inspected" && inspectionDate) {
      const inspectionDateObj = new Date(inspectionDate);

      // Check if inspectionDate is today
      return (
        inspectionDateObj.getFullYear() === date.getFullYear() &&
        inspectionDateObj.getMonth() === date.getMonth() &&
        inspectionDateObj.getDate() === date.getDate()
      );
    }

    return false;
  });

  const groupStructuresByType = (structures) => {
    return structures.data.reduce((acc, structure) => {
      const { status, adminStatus } = structure.attributes;

      // Group by status
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(structure);

      // Check if adminStatus is "Uploaded" and add to the "Uploaded" group
      if (adminStatus === "Uploaded") {
        if (!acc["Uploaded"]) {
          acc["Uploaded"] = [];
        }
        acc["Uploaded"].push(structure);
      }

      return acc;
    }, {});
  };

  const groupedStructuresByType = groupStructuresByType(structures);

  const allStructureTypes = Object.keys(groupedStructuresByType).map(
    (status) => {
      return {
        name: status,
        count: groupedStructuresByType[status].length,
      };
    }
  );

  const structuresRescheduled = structures.data.filter(
    (structure) => structure.attributes.status === "Reschedule"
  );

  return (
    <div className="flex gap-4 flex-col justify-between py-6">
      <section className="flex justify-between">
        <h1 className="leading-tight text-2xl font-medium">
          {team?.data.data.attributes.name || "Team Name"}
          {" - "}
          <span className=" font-light text-gray-500">
            {date.toLocaleDateString()}
          </span>
        </h1>

        <ScheduleDate date={date} teamId={params.id} />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-5 p-0 bg-white rounded-md gap-0 mx-h-[800px] md:h-[650px] shadow-sm ">
        <div className="p-3 md:p-6 gap-3 col-span-2 h-[475px] md:h-[650px] order-2 md:order-1 overflow-y-auto relative">
          <div className="flex flex-col gap-4">
            <StructureStatusStats
              allStructureTypes={allStructureTypes}
              totalStructures={structures.data.length}
            />
          </div>

          <div className="flex flex-col gap-4 mt-8">
            <h3 className="text-md font-bold dark:text-white">
              Maps Scheduled{" - "}
              <span className=" font-light text-gray-500">
                {date.toLocaleDateString()}
              </span>
            </h3>

            <MapTabsDropdowns
              groupedStructures={groupedArray}
              structuresRescheduled={structuresRescheduled}
            />
          </div>

          <div className="flex flex-col gap-4 mt-8">
            <InspectedStructuresTable
              date={date}
              structures={structuresInspectedToday}
            />
          </div>
        </div>
        <div className="relative border-white border-2 dark:border-gray-600 bg-gray-200 rounded-lg h-[275px] md:h-full col-span-3 order-1 md:order-2">
          <MapboxMap
            lng={0}
            lat={0}
            zoom={16}
            style="mapbox://styles/mapbox/standard-beta"
            coordinates={structures.data}
          />
        </div>
      </section>

      <section className="bg-white p-0 md:p-0 rounded-md shadow-md">
        <StructuresInspectedHeatmap structures={structuresInspectedToday} />
      </section>
    </div>
  );
}

const StructureStatusStats = ({ allStructureTypes, totalStructures }) => {
  const StructureStat = ({ name, count, backgroundColor }) => {
    return (
      <div className="flex flex-col rounded-lg p-7 bg-white hover:bg-gray-50 border border-gray-300 aspect-square flex-shrink-0 flex-grow-0 w-[150px]">
        <div
          className="flex w-14 h-14 rounded-full m-auto text-center"
          style={{ backgroundColor }}
        >
          <p className="text-xl text-white m-auto text-center">{count}</p>
        </div>
        <p
          className="text-xs text-center font-semibold mt-2"
          style={{ color: backgroundColor }}
        >
          {name}
        </p>
      </div>
    );
  };

  return (
    <div className="flex gap-4 overflow-x-scroll max-h-[250px] md:max-h-[400px]">
      <StructureStat
        name="Total"
        count={totalStructures}
        backgroundColor={statusColors["Total"]}
      />

      {allStructureTypes.map((type, index) => (
        <StructureStat
          key={`stat-${index}`}
          name={type.name}
          count={type.count}
          backgroundColor={statusColors[type.name]}
        />
      ))}
    </div>
  );
};
