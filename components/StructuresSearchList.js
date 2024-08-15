"use client";

import { useState } from "react";
import { TextInput } from "flowbite-react";
import StructureScheduledTag from "./StructureScheduledTag";
import { CheckMark, PlusIcon } from "../public/icons/intangible-icons";
import StructureStatusBadge from "./StructureStatusBadge";
import {
  sortStructuresByStatus,
  getColorBasedOnStatus,
  getInspectionColor,
  ensureDomain,
  loadIcon,
} from "../utils/strings";
import { useSelectedStructure } from "../context/SelectedStructureContext";

export default function StructureSearchList({ structures }) {
  const [structureSearch, setStructureSearch] = useState("");
  const { selectedStructure, setSelectedStructure } = useSelectedStructure();

  const iconMap = {
    red: "/location-red.png",
    yellow: "/location-yellow.png",
    drkgreen: "/location-dark.png",
    green: "/location-green.png",
  };

  const loadIcon = (color) => iconMap[color] || "/location-red.png";

  /**
   * This function filters structures based on a search term.
   * @param {string} searchTerm - The term to search for.
   * @returns {Array} The filtered structures.
   */
  const filterStructures = (searchTerm) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filteredStructuresList =
      structures.filter((structure) => {
        const attributes = structure.attributes;
        return ["status", "mapSection", "type"].some((field) =>
          attributes[field].toLowerCase().includes(lowerCaseSearchTerm)
        );
      }) || [];

    return filteredStructuresList;
  };

  const filteredStructures = sortStructuresByStatus(
    filterStructures(structureSearch)
  );

  return (
    <>
      {!selectedStructure && (
        <div className="p-4 w-full bg-gray-100">
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
          </div>
        </div>
      )}

      {!selectedStructure && (
        <div className="im-snapping overflow-x-auto w-full">
          {filteredStructures.map((structure, index) => (
            <div
              key={`${structure.id}-${index}`}
              className={`flex flex-row cursor-pointer justify-between items-center bg-white border-0 border-b-2 border-gray-100  hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 p-4 mb-0`}
              onClick={(e) => {
                e.preventDefault(); // Prevent default click behavior
                e.stopPropagation(); // Stop propagation if necessary

                setSelectedStructure(structure);
              }}
            >
              <div className="flex">
                <img
                  src={loadIcon(
                    getColorBasedOnStatus(structure.attributes.status)
                  )}
                  style={{ height: 27 }}
                />

                <div className="flex flex-col justify-between pt-0 pb-0 pl-4 pr-4 leading-normal gap-1">
                  <h5 className="flex flex-shrink-0 mb-1 text-sm font-bold tracking-tight text-gray-900 dark:text-white">
                    {structure.attributes.mapSection}
                    <span className="flex items-center font-light ml-1">
                      {` / ${structure.attributes.type}`}
                    </span>
                  </h5>
                  <StructureScheduledTag structure={structure} />
                </div>
              </div>

              <div className="flex">
                <StructureStatusBadge
                  status={structure.attributes.status}
                  adminStatus={structure.attributes.adminStatus}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
