import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/auth";
import qs from "qs";
import { statusColors } from "../../../utils/collectionListAttributes";
import { fetchAllStructure } from "../../../utils/api/structures";
import { sortStructuresByStatus } from "../../../utils/strings";

export default async function Page({ params }) {
  const session = await getServerSession(authOptions);
  const date = new Date();

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
      },
    },
    {
      encodeValuesOnly: true,
    }
  );

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

  return (
    <div className="flex gap-4 flex-col justify-between py-6 animate-pulse">
      <section className="flex flex-between">
        <div className="h-5 bg-slate-200 rounded-full dark:bg-gray-700 w-64 mb-4"></div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-5 p-0 bg-white rounded-md gap-0 mx-h-[800px] md:h-[650px] shadow-sm ">
        <div className="p-3 md:p-6 gap-3 col-span-2 h-[475px] md:h-[650px] order-2 md:order-1 overflow-y-auto">
          <StructureStatusStats
            allStructureTypes={allStructureTypes}
            totalStructures={structures.data.length}
          />

          <div className="flex flex-col gap-4 mt-8">
            <div className="h-3 bg-slate-200 rounded-full dark:bg-gray-700 w-48"></div>

            <div className="flex flex-col gap-2">
              {[0, 0, 0].map((map, index) => (
                <div
                  key={`map-${index}`}
                  className="border rounded-md bg-slate-50 p-5"
                >
                  <div className="h-3 bg-slate-200 rounded-full dark:bg-gray-700 w-32 mr-auto"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-8">
            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-48"></div>

            <div className="flex flex-col gap-0 border">
              {[0, 0, 0].map((table, index) => (
                <div key={`table-${index}`} className="border-b p-4">
                  <div className="h-3 bg-slate-200 rounded-full dark:bg-gray-700 w-32 mr-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="relative border-white border-2 dark:border-gray-600 bg-gray-200 rounded-lg h-[275px] md:h-full col-span-3 order-1 md:order-2"></div>
      </section>

      <section></section>
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
