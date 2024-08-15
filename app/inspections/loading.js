export default function Loading() {
  return (
    <>
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

          <div
            className={`grid grid-cols-2 gap-4 overflow-x-scroll col-span-1`}
          >
            {[0, 0, 0, 0].map((stat, index) => (
              <div
                className={`flex flex-col rounded-lg p-7  bg-slate-200 hover:bg-gray-50 border border-slate-200 aspect-square flex-shrink-0 flex-grow-0 w-full`}
                key={index}
              ></div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-6 mb-4 bg-gray-50 border border-gray-200 rounded-md">
        <h3 className="text-xl font-bold dark:text-white">
          Favorite Inspections
        </h3>

        <div className="flex overflow-x-scroll hide-scroll-bar">
          <div className="flex flex-nowrap gap-3">
            {[0, 0, 0, 0].map((inspection, index) => (
              <div
                key={`inspection-${index}`}
                className="inline-block rounded-lg overflow-hidden transition-all duration-200 ease-in-out border border-gray-200"
              >
                <div className="w-80 max-w-xs h-[75px] bg-white p-6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
