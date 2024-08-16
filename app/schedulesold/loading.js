export default async function Page({ params }) {
  return (
    <div className="flex gap-4 flex-col justify-between py-6">
      <section className="grid grid-col md:grid-cols-8 p-0 rounded-md gap-4">
        <div className="flex flex-col col-span-8 gap-3">
          <div className="shadow-sm border-gray-400 bg-slate-50 p-4 md:p-6 rounded-lg w-full h-full">
            <h5 className="text-xl font-bold dark:text-white mb-3">
              Teams Scheduled
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 animate-pulse">
              {[0, 0, 0, 0, 0].map((team, index) => (
                <div
                  key={`${index}-scheduled`}
                  className="bg-white hover:bg-gray-50 rounded-lg p-5 aspect-video overflow-hidden border cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5"></div>
                    <div className="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                  </div>
                  <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12"></div>
                </div>
              ))}
            </div>

            <h6 className=" text-xs text-gray-400 border-b border-gray-300 mt-6 mb-4 pb-2">
              All Teams
            </h6>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 animate-pulse">
              {[0, 0, 0, 0, 0].map((team, index) => (
                <div
                  key={`${index}-all`}
                  className="bg-white hover:bg-gray-50 rounded-lg p-5 aspect-video overflow-hidden border cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5"></div>
                    <div className="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                  </div>
                  <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
