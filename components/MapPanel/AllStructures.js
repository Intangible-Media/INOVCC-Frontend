export default function AllStructures({
  filteredStructures,
  selectedStructure,
  setSelectedStructure,
  updateCenterOnClick,
  setActiveView,
}) {
  return (
    <div className="im-snapping overflow-x-auto w-full">
      {filteredStructures.map((structure, index) => (
        <div
          key={`${structure.id}-${index}`}
          className={`flex flex-row cursor-pointer justify-between items-center bg-white border-0 border-b-2 border-gray-100 md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 p-4 mb-0 ${
            selectedStructure &&
            selectedStructure.id === structure.id &&
            "active-structure"
          }`}
          onClick={() => {
            updateCenterOnClick(
              structure.attributes.longitude,
              structure.attributes.latitude
            );
            setSelectedStructure(structure);
            setActiveView("singleView");
          }}
        >
          <div className="flex">
            <img
              src={loadIcon(getColorBasedOnStatus(structure.attributes.status))}
              style={{ height: 27 }}
            />

            <div className="flex flex-col justify-between pt-0 pb-0 pl-4 pr-4 leading-normal">
              <h5 className="flex flex-shrink-0 mb-1 text-sm font-bold tracking-tight text-gray-900 dark:text-white">
                {structure.attributes.mapSection}
                <span className="flex items-center font-light ml-1">
                  {` / ${structure.attributes.type}`}
                </span>
              </h5>

              {/* <DirectionsComponent /> */}
            </div>
          </div>

          <div className="flex">
            <p className="flex text-sm text-gray-700 dark:text-gray-400">
              <span
                className={`${getInspectionColor(
                  structure.attributes.status
                )} flex align-middle text-xs font-medium me-2 px-2.5 py-0.5 gap-2 rounded-full`}
              >
                {structure.attributes.status}
                {structure.attributes.status === "Uploaded" && "<CheckMark />"}
              </span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
