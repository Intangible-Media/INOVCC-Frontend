"use client";

import { useState } from "react";
import { formatToReadableTime } from "../../utils/strings";
import { useSelectedStructure } from "../../context/SelectedStructureContext";
import StructureStatusBadge from "../StructureStatusBadge";
import { useLoading } from "../../context/LoadingContext";
import {
  Button,
  Table,
  TableBody,
  Badge,
  TableCell,
  TableHead,
  TableHeadCell,
  Tooltip,
  TableRow,
  Clipboard,
} from "flowbite-react";
import { FaCheck } from "react-icons/fa6";
import {
  convertInspectionsToZipArgs,
  getColorBasedOnStatus,
  downloadFilesAsZipWithSubfolders,
} from "../../utils/strings";
import {
  adminStatuses,
  structurePinStatus,
} from "../../utils/collectionListAttributes";

const CheckMark = () => <FaCheck size={11} color="white" />;

const InspectedStructuresTable = ({
  date = new Date(),
  structures,
  showHeadingInformation = true,
}) => {
  const { selectedStructure, setSelectedStructure } = useSelectedStructure();
  const { showLoading, hideLoading, showSuccess } = useLoading();
  const [projectIdTooltipContent, setProjectIdTooltipContent] =
    useState("Project ID");
  const [mapNameTooltipContent, setMapNameTooltipContent] =
    useState("Map Name");
  const loadIcon = (color) => structurePinStatus[color] || "/location-red.png";

  const handleCopyProjectId = () => {
    setProjectIdTooltipContent("Copied");
    setTimeout(() => setProjectIdTooltipContent("Project ID"), 2000); // Reset after 2 seconds
  };

  const handleCopyMapName = () => {
    setMapNameTooltipContent("Copied");
    setTimeout(() => setMapNameTooltipContent("Map Name"), 2000); // Reset after 2 seconds
  };

  return (
    <>
      {showHeadingInformation && (
        <div className="flex flex-col md:flex-row gap-2 justify-between">
          <div>
            <h3 className="flex text-md font-bold dark:text-white my-auto">
              Structures Inspected{" "}
              <Badge className="mt-0.5 mx-1">{structures.length}</Badge>
            </h3>
            <h6 className="text-sm font-light">
              These are structures inspected on{" "}
              <span className=" font-bold text-gray-600">
                {date.toLocaleDateString()}
              </span>
            </h6>
          </div>

          <Button
            className="bg-dark-blue-700 text-white flex-grow-0 my-auto"
            size={"sm"}
            onClick={async (e) => {
              const inspectedStructures = structures.filter((structure) => {
                const { status, adminStatus, inspectionDate } =
                  structure.attributes;

                if (status === "Inspected" && adminStatus !== "Uploaded") {
                  // Check if inspectionDate is today
                  return structure;
                }

                return false;
              });

              showLoading(
                `Downloading all documents for ${inspectedStructures.length} structures`
              );

              const formattedStructures =
                convertInspectionsToZipArgs(inspectedStructures);

              try {
                const response = await downloadFilesAsZipWithSubfolders(
                  formattedStructures,
                  date.toLocaleDateString()
                );

                showSuccess("Download finished successfully!");
              } catch (error) {
                console.error(error);
                hideLoading();
              }
            }}
          >
            Download
          </Button>
        </div>
      )}
      <div className="flex flex-col gap-0 border">
        <div className=" overflow-auto overflow-x-auto w-full">
          <Table striped className="">
            <TableHead className="sticky">
              <TableHeadCell className=" w-[20px] pr-1">Pin</TableHeadCell>
              <TableHeadCell>Map Section</TableHeadCell>
              <TableHeadCell className=" w-[200px] shorten-text">
                Map & Project #
              </TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
              <TableHeadCell>Time</TableHeadCell>
            </TableHead>
            <TableBody className="divide-y">
              {structures.map((structure, index) => (
                <TableRow
                  key={index}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <TableCell className=" w-[20px] pr-1">
                    <img
                      src={loadIcon(
                        getColorBasedOnStatus(structure.attributes.status)
                      )}
                      style={{ height: 27 }}
                    />
                  </TableCell>
                  <TableCell
                    className=" cursor-pointer"
                    onClick={() => setSelectedStructure(structure)}
                  >
                    <h4 className="font-medium text-base text-dark-blue-700 dark:text-white">
                      {structure.attributes.mapSection}
                    </h4>
                    <p className=" text-xs">{structure.attributes.type}</p>
                  </TableCell>

                  <TableCell className=" w-[200px] shorten-text overflow-hidden">
                    <div className="flex flex-col gap-1">
                      <Tooltip content={projectIdTooltipContent}>
                        <div className="hide-extra-tooltip grid w-full max-w-[23rem] grid-cols-8 gap-2">
                          <label htmlFor="npm-install" className="sr-only">
                            Label
                          </label>
                          <input
                            id="npm-install"
                            type="text"
                            className="hidden w-full border-0 p-0 text-sm"
                            value="Project ID"
                            disabled
                            readOnly
                          />
                          <Clipboard
                            valueToCopy={
                              structure?.attributes.inspection.data?.attributes
                                .projectId || ""
                            }
                            className="p-0 bg-transparent text-gray-800 text-xs black-text focus:border-0 hover:bg-transparent"
                            label={
                              structure?.attributes.inspection.data?.attributes
                                .projectId || ""
                            }
                            onClick={handleCopyProjectId}
                          />
                        </div>
                      </Tooltip>

                      <Tooltip content={mapNameTooltipContent}>
                        <div className="hide-extra-tooltip grid w-full max-w-[23rem] grid-cols-8 gap-2">
                          <label htmlFor="npm-install" className="sr-only">
                            Label
                          </label>
                          <input
                            id="npm-install"
                            type="text"
                            className="hidden w-full border-0 p-0 text-sm"
                            value="Map Name"
                            disabled
                            readOnly
                          />
                          <Clipboard
                            valueToCopy={
                              structure?.attributes.inspection.data?.attributes
                                .name || ""
                            }
                            className="p-0 bg-transparent text-gray-800 text-xs black-text focus:border-0 hover:bg-transparent"
                            label={
                              structure?.attributes.inspection.data?.attributes
                                .name || ""
                            }
                            onClick={handleCopyMapName}
                          />
                        </div>
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StructureStatusBadge
                      wpPassFail={structure.attributes.wpPassFail}
                      status={structure.attributes.status}
                      adminStatus={structure.attributes.adminStatus}
                    />
                  </TableCell>
                  <TableCell>
                    <p className="w-24">
                      {formatToReadableTime(
                        structure.attributes.inspectionDate
                      )}
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default InspectedStructuresTable;
