export default function Loading() {
  return (
    <div className="flex gap-4 flex-col justify-between py-6 animate-pulse">
      <section className="flex flex-between">
        <div className="h-5 bg-slate-200 rounded-full dark:bg-gray-700 w-64 mb-4"></div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-5 p-0 bg-white rounded-md gap-0 mx-h-[800px] md:h-[650px] shadow-sm ">
        <div className="p-3 md:p-6 gap-3 col-span-2 h-[475px] md:h-[650px] order-2 md:order-1 overflow-y-auto">
          <div
            className={`flex gap-4 overflow-x-scroll max-h-[250px] md:max-h-[400px]`}
          >
            {[0, 0, 0, 0, 0].map((stat, index) => (
              <div
                className={`flex flex-col rounded-lg p-7  bg-slate-100 hover:bg-gray-50 border border-slate-200 aspect-square flex-shrink-0 flex-grow-0 w-[150px]`}
                key={index}
              ></div>
            ))}
          </div>

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
