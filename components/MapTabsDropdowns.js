"use client";

import { useState } from "react";
import { Badge } from "flowbite-react";
import { FaRegStar } from "react-icons/fa6";
import StructureGroupProgress from "./Charts/StructuresGroupProgress";
import { CheckMark } from "../public/icons/intangible-icons";
import DirectionsComponent from "./DirectionsComponent";
import StructureScheduledTag from "./StructureScheduledTag";
import StructureNameTypeTag from "./StructureNameTypeTag";
import StructureStatusBadge from "./StructureStatusBadge";
import { getColorBasedOnStatus, getInspectionColor } from "../utils/strings";
import { IoIosArrowDown } from "react-icons/io";
import { useSelectedStructure } from "../context/SelectedStructureContext";
import MapPanelalt from "./Panel/MapPanelalt";
import { useParams } from "next/navigation";
import { refreshSchedulenData } from "../app/actions";

const MapStructuresTabs = ({ groupedStructures, structuresRescheduled }) => {
  const { selectedStructure, setSelectedStructure } = useSelectedStructure();
  const [expandRescheduled, setExpandRescheduled] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState(null);

  const toggleGroup = (index) => {
    setExpandedGroup(expandedGroup === index ? null : index);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col border border-gray-300 rounded-md">
        <div
          className="flex justify-between p-3 cursor-pointer"
          onClick={() => setExpandRescheduled(!expandRescheduled)}
        >
          <div className="flex gap-3">
            <IoIosArrowDown
              className={`my-auto ${
                expandRescheduled ? "rotate-0" : "-rotate-90"
              }`}
            />
            <h3 className="text-base text-gray-700 font-medium flex gap-2 align-middle">
              Rescheduled
              <Badge className="mt-0.5">{structuresRescheduled.length}</Badge>
            </h3>
          </div>
          <StructureGroupProgress structures={structuresRescheduled} />
        </div>
        <div
          className={`overflow-scroll transition-max-height duration-200 ease-in-out ${
            expandRescheduled ? "max-h-[450px]" : "max-h-0"
          }`}
        >
          {expandRescheduled && (
            <div className="overflow-scroll w-full h-full mb-4">
              {structuresRescheduled.map((structure, index) => (
                <div
                  key={`${structure.id}-${index}-rescheduled`}
                  className="flex flex-row cursor-pointer justify-between items-center bg-white border-0 border-b-2 border-gray-100 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 p-4 mb-0 w-full"
                  onClick={() => {
                    console.log("structure", structure);
                    setSelectedStructure(structure);
                  }}
                >
                  <StructureNameTypeTag structure={structure} />

                  <StructureStatusBadge
                    wpPassFail={structure.attributes.wpPassFail}
                    status={structure.attributes.status}
                    adminStatus={structure.attributes.adminStatus}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {groupedStructures.map((structureGroup, index) => (
        <div
          className="flex flex-col border border-gray-300 rounded-md"
          key={`structure-group-${index}`}
        >
          <div
            className="flex justify-between p-3 cursor-pointer"
            onClick={() => toggleGroup(index)}
          >
            <div className="flex gap-3">
              <IoIosArrowDown
                className={`my-auto ${
                  expandedGroup === index ? "rotate-0" : "-rotate-90"
                }`}
              />

              <h3 className="text-base text-gray-700 font-medium flex gap-2 align-middle">
                {structureGroup.mapName}
                <Badge className="mt-0.5">
                  {structureGroup.structures.length}
                </Badge>
              </h3>
            </div>

            <StructureGroupProgress structures={structureGroup.structures} />
          </div>
          <div
            className={`overflow-scroll transition-max-height duration-200 ease-in-out ${
              expandedGroup === index ? "max-h-[450px]" : "max-h-0"
            }`}
          >
            {expandedGroup === index && (
              <div className="overflow-auto w-full h-full mb-4">
                {structureGroup.structures.map((structure) => (
                  <div
                    key={`${structure.id}-${index}`}
                    className="flex flex-row cursor-pointer justify-between items-center bg-white border-0 border-b-2 border-gray-100 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 p-4 mb-0 w-full"
                    onClick={() => setSelectedStructure(structure)}
                  >
                    <StructureNameTypeTag structure={structure} />

                    <div className="flex-col gap-1 hidden md:flex">
                      <span className="leading-none font-medium text-xs text-gray-900">
                        {structure?.attributes.inspection.data?.attributes
                          .name || ""}
                      </span>
                      <span className="leading-none font-medium text-xs text-gray-900">
                        {structure?.attributes.inspection.data?.attributes
                          .projectId || ""}
                      </span>
                    </div>

                    <StructureStatusBadge
                      wpPassFail={structure.attributes.wpPassFail}
                      status={structure.attributes.status}
                      adminStatus={structure.attributes.adminStatus}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MapStructuresTabs;
