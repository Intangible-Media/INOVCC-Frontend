"use client";

import { useState } from "react";

const MapStructuresTabs = ({ groupedStructures }) => {
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [expandRescheduled, setExpandRescheduled] = useState(false);

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
          <h3 className="text-base text-gray-700 font-medium flex gap-2 align-middle">
            Rescheduled
            <Badge className="mt-0.5">{structuresRescheduled.length}</Badge>
          </h3>
          <StructureGroupProgress structures={structuresRescheduled} />
        </div>
        <div
          className={`overflow-scroll transition-max-height duration-200 ease-in-out ${
            expandRescheduled ? "max-h-[350px]" : "max-h-0"
          }`}
        >
          {expandRescheduled && (
            <div className="overflow-scroll w-full h-full mb-4">
              {structuresRescheduled.map((structure, index) => (
                <div
                  key={`${structure.id}-${index}-rescheduled`}
                  className="flex flex-row cursor-pointer justify-between items-center bg-white border-0 border-b-2 border-gray-100 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 p-4 mb-0 w-full"
                  onClick={() => {
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
                    <div className="flex flex-col justify-between pt-0 pb-0 pl-4 pr-4 leading-normal">
                      <h5 className="flex flex-col md:flex-row flex-shrink-0 mb-1 text-sm font-bold tracking-tight text-gray-900 dark:text-white">
                        <span className="flex shorten-text">
                          {structure.attributes.mapSection}
                          {structure.attributes.favorited && (
                            <FaRegStar className="text-dark-blue-700 w-5 ml-1 mt-0.5" />
                          )}
                        </span>
                        <span className="flex items-center font-light ml-1">
                          {`${structure.attributes.type}`}
                        </span>
                      </h5>
                      <DirectionsComponent />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <p className="flex text-sm text-gray-700 dark:text-gray-400">
                      <span
                        className={`${getInspectionColor(
                          structure.attributes.status
                        )} flex align-middle text-xs font-medium me-2 px-2.5 py-0.5 gap-2 rounded-full`}
                      >
                        {structure.attributes.status}
                        {structure.attributes.status === "Uploaded" && (
                          <CheckMark />
                        )}
                      </span>
                    </p>
                  </div>
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
            <h3 className="text-base text-gray-700 font-medium flex gap-2 align-middle">
              {structureGroup.mapName}
              <Badge href="#" className="mt-0.5">
                {structureGroup.structures.length}
              </Badge>
            </h3>
            <StructureGroupProgress structures={structureGroup.structures} />
          </div>
          <div
            className={`overflow-scroll transition-max-height duration-200 ease-in-out ${
              expandedGroup === index ? "max-h-[350px]" : "max-h-0"
            }`}
          >
            {expandedGroup === index && (
              <div className="overflow-auto w-full h-full mb-4">
                {structureGroup.structures.map((structure) => (
                  <div
                    key={`${structure.id}-${index}`}
                    className="flex flex-row cursor-pointer justify-between items-center bg-white border-0 border-b-2 border-gray-100 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 p-4 mb-0 w-full"
                    onClick={() => {
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
                      <div className="flex flex-col justify-between pt-0 pb-0 pl-4 pr-4 leading-normal">
                        <h5 className="flex flex-col md:flex-row flex-shrink-0 mb-1 text-sm font-bold tracking-tight text-gray-900 dark:text-white">
                          <span className="flex shorten-text">
                            {structure.attributes.mapSection}
                            {structure.attributes.favorited && (
                              <FaRegStar className="text-dark-blue-700 w-5 ml-1 mt-0.5" />
                            )}
                          </span>
                          <span className="flex items-center font-light ml-1">
                            {`${structure.attributes.type}`}
                          </span>
                        </h5>
                        <DirectionsComponent />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <p className="flex text-sm text-gray-700 dark:text-gray-400">
                        <span
                          className={`${getInspectionColor(
                            structure.attributes.status
                          )} flex align-middle text-xs font-medium me-2 px-2.5 py-0.5 gap-2 rounded-full`}
                        >
                          {structure.attributes.status}
                          {structure.attributes.status === "Uploaded" && (
                            <CheckMark />
                          )}
                        </span>
                      </p>
                    </div>
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
