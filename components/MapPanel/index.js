import AllStructures from "./AllStructures";
import SingleStructure from "./SingleStructure";
import { useState } from "react";

export default function MapPanel({
  structureSearch,
  setStructureSearch,
  selectedStructure,
  setSelectedStructure,
  updateCenterOnClick,
  filteredStructures,
}) {
  const [activeView, setActiveView] = useState("overview");

  return (
    <div className="map-structure-panel shadow-sm flex flex-col items-center border-gray-300 dark:border-gray-600 bg-white w-full z-10 h-32 rounded-lg absolute right-8 top-8 bottom-8 overflow-hidden">
      {/* <div className="p-4 w-full bg-gray-100">
        <div className="relative">
          <TextInput
            id="small"
            type="text"
            placeholder="Search Structures"
            sizing="md"
            className="w-full relative"
            value={structureSearch}
            onChange={(e) => setStructureSearch(e.target.value)}
          />

          {structureSearch || activeView === "singleView" ? (
            <div
              className="exit-icon absolute right-5 cursor-pointer mt-3"
              onClick={(e) => {
                setActiveView("overview");
                setStructureSearch("");
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M7.05864 6L11.0214 2.03721C11.0929 1.96814 11.15 1.88553 11.1892 1.79419C11.2285 1.70284 11.2491 1.6046 11.25 1.50519C11.2508 1.40578 11.2319 1.30719 11.1942 1.21518C11.1566 1.12317 11.101 1.03958 11.0307 0.969285C10.9604 0.898989 10.8768 0.843396 10.7848 0.805752C10.6928 0.768107 10.5942 0.749164 10.4948 0.750028C10.3954 0.750892 10.2972 0.771546 10.2058 0.810783C10.1145 0.850021 10.0319 0.907058 9.96279 0.978565L6 4.94136L2.03721 0.978565C1.896 0.842186 1.70688 0.766722 1.51058 0.768428C1.31428 0.770134 1.1265 0.848873 0.987685 0.987685C0.848873 1.1265 0.770134 1.31428 0.768428 1.51058C0.766722 1.70688 0.842186 1.896 0.978565 2.03721L4.94136 6L0.978565 9.96279C0.907058 10.0319 0.850021 10.1145 0.810783 10.2058C0.771546 10.2972 0.750892 10.3954 0.750028 10.4948C0.749164 10.5942 0.768107 10.6928 0.805752 10.7848C0.843396 10.8768 0.898989 10.9604 0.969285 11.0307C1.03958 11.101 1.12317 11.1566 1.21518 11.1942C1.30719 11.2319 1.40578 11.2508 1.50519 11.25C1.6046 11.2491 1.70284 11.2285 1.79419 11.1892C1.88553 11.15 1.96814 11.0929 2.03721 11.0214L6 7.05864L9.96279 11.0214C10.104 11.1578 10.2931 11.2333 10.4894 11.2316C10.6857 11.2299 10.8735 11.1511 11.0123 11.0123C11.1511 10.8735 11.2299 10.6857 11.2316 10.4894C11.2333 10.2931 11.1578 10.104 11.0214 9.96279L7.05864 6Z"
                  fill="#6B7280"
                />
              </svg>
            </div>
          ) : null}
        </div>

        {activeView === "overview" && (
          <div className="justify-center gap-4 mt-3 hidden">
            <p className="text-sm font-medium">Show Only:</p>
            <div className="flex items-center gap-2">
              <Checkbox id="cant-inspect" />
              <Label className="text-sm font-medium" htmlFor="cant-inspect">
                {"Can't Inspect"}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="inspected" />
              <Label className="text-sm font-medium" htmlFor="inspected">
                Inspected
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="uploaded" />
              <Label className="text-sm font-medium" htmlFor="uploaded">
                Uploaded
              </Label>
            </div>
          </div>
        )}
      </div> */}

      {activeView === "singleView" && <SingleStructure />}

      {activeView === "overview" && <AllStructures />}
    </div>
  );
}
