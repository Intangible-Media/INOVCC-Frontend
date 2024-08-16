import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/auth";
import ProgressCard from "../../components/Cards/Progress";
import { fetchAllTeams } from "../../utils/api/teams";

export default async function Page({ params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <p>You must be logged in to view this page.</p>;
  }

  const teams = await fetchAllTeams({
    jwt: session?.accessToken,
    query: "",
  });

  return (
    <div className="flex gap-4 flex-col justify-between py-6">
      <section className="grid grid-col md:grid-cols-8 p-0 rounded-md gap-4">
        <div className="flex flex-col col-span-8 gap-3">
          <div className="shadow-sm border-gray-400 bg-slate-50 p-4 md:p-6 rounded-lg w-full h-full">
            <h6 className=" text-xs text-gray-400 border-b border-gray-300 mt-6 mb-4 pb-2">
              All Teams
            </h6>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {teams.data.map((team, index) => (
                <ProgressCard key={index} team={team} showEmpty={false} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
