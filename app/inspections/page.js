import { getServerSession } from "next-auth";
import { authOptions } from "../../app/api/auth/[...nextauth]/auth";
import dynamic from "next/dynamic";
import axios from "axios";
import { fetchAllInspections } from "../../utils/api/inspections";
import InspectionTable from "../../components/InspectionTable";
import InspectionCreateDrawer from "../../components/Drawers/InspectionCreateDrawer";
import FavoriteInspectionCard from "../../components/Cards/FavoriteInspectionCard";
import ProtectedContent from "../../components/ProtectedContent";
// import StructuresInspectedBarChart from "../../components/Charts/StructuresInspectedBarChart";
import qs from "qs";
const StructuresInspectedBarChart = dynamic(
  () => import("../../components/Charts/StructuresInspectedBarChart"),
  {
    ssr: false, // or ssr: false, depending on your needs
    loading: () => <Loading />, // Provide the loading component here
  }
);

const Loading = () => (
  <div className="flex flex-col justify-between h-full md:h-[525px] bg-slate-100 border border-slate-200 mb-4 animate-pulse p-6">
    <div className="flex justify-between">
      <div className="flex flex-col gap-2">
        <div className="h-3 bg-slate-200 rounded-full dark:bg-gray-700 w-48"></div>
        <div className="h-3 bg-slate-200 rounded-full dark:bg-gray-700 w-36"></div>
      </div>

      <div className="flex gap-4">
        <div className="w-full md:w-52 h-11 bg-slate-200 rounded-md"></div>
        <div className="w-full md:w-52 h-11 bg-slate-200 rounded-md"></div>
        <div className="w-full md:w-52 h-11 bg-slate-200 rounded-md"></div>
        <div className="w-full md:w-52 h-11 bg-slate-200 rounded-md"></div>
      </div>
    </div>

    <div className="grid grid-cols-4 gap-3 md:pt-6">
      <div
        role="status"
        className="col-span-3 animate-pulse dark:border-gray-700 "
      >
        <div className="flex items-baseline mt-4">
          <div className="w-full bg-gray-200 rounded-t-lg h-72 dark:bg-gray-700"></div>
          <div className="w-full h-56 ms-6 bg-gray-200 rounded-t-lg dark:bg-gray-700"></div>
          <div className="w-full bg-gray-200 rounded-t-lg h-72 ms-6 dark:bg-gray-700"></div>
          <div className="w-full h-64 ms-6 bg-gray-200 rounded-t-lg dark:bg-gray-700"></div>
          <div className="w-full bg-gray-200 rounded-t-lg h-80 ms-6 dark:bg-gray-700"></div>
          <div className="w-full bg-gray-200 rounded-t-lg h-80 ms-6 dark:bg-gray-700"></div>
          <div className="w-full bg-gray-200 rounded-t-lg h-80 ms-6 dark:bg-gray-700"></div>
          <div className="w-full bg-gray-200 rounded-t-lg h-80 ms-6 dark:bg-gray-700"></div>
          <div className="w-full bg-gray-200 rounded-t-lg h-72 ms-6 dark:bg-gray-700"></div>
          <div className="w-full bg-gray-200 rounded-t-lg h-80 ms-6 dark:bg-gray-700"></div>
        </div>
        <span className="sr-only">Loading...</span>
      </div>

      <div className={`grid grid-cols-2 gap-4 overflow-x-scroll col-span-1`}>
        {[0, 0, 0, 0].map((stat, index) => (
          <div
            className={`flex flex-col rounded-lg p-7  bg-slate-200 hover:bg-gray-50 border border-slate-200 aspect-square flex-shrink-0 flex-grow-0 w-full`}
            key={index}
          ></div>
        ))}
      </div>
    </div>
  </div>
);

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) return <p>You must be logged in to view this page.</p>;

  const inspectionQuery = qs.stringify({
    populate: {
      fields: ["name"],
      structures: {
        fields: ["status", "inspectionDate", "type"],
      },
      client: {
        populate: {
          fields: ["name"],
        },
      },
    },
  });

  const favoriteInspectionsQuery = qs.stringify({
    filters: {
      favorited_by: {
        id: {
          $eq: session?.user.id,
        },
      },
    },
    populate: {
      structures: {
        fields: ["status", "name", "type"],
      },
    },
  });

  const inspections = await fetchAllInspections({
    jwt: session.accessToken,
    query: inspectionQuery,
  });

  const favoriteInspections = await fetchAllInspections({
    jwt: session.accessToken,
    query: favoriteInspectionsQuery,
  });

  return (
    <>
      <div className="grid grid-cols-1 my-4">
        <InspectionCreateDrawer />
      </div>

      <StructuresInspectedBarChart />

      {favoriteInspections.length > 0 && (
        <div className="flex flex-col gap-3 p-6 mb-4 bg-gray-50 border border-gray-200 rounded-md">
          <h3 className="text-xl font-bold dark:text-white">
            Favorite Inspections
          </h3>

          <div className="flex overflow-x-scroll hide-scroll-bar">
            <div className="flex flex-nowrap gap-3">
              {favoriteInspections.map((inspection, index) => (
                <FavoriteInspectionCard key={index} inspection={inspection} />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 mb-4 shadow-none">
        <div className="border-gray-300 rounded-lg dark:border-gray-600 bg-white p-0 shadow-none">
          <InspectionTable inspectionData={inspections} />
        </div>
      </div>
    </>
  );
}
