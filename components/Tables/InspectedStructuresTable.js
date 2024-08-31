"use client";

import { formatToReadableTime } from "../../utils/strings";
import { useSelectedStructure } from "../../context/SelectedStructureContext";
import { Button } from "flowbite-react";
import StructureStatusBadge from "../StructureStatusBadge";
import { useLoading } from "../../context/LoadingContext";
import {
  Table,
  TableBody,
  Badge,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { FaCheck } from "react-icons/fa6";
import {
  convertInspectionsToZipArgs,
  downloadFilesAsZipWithSubfolders,
} from "../../utils/strings";
import { adminStatuses } from "../../utils/collectionListAttributes";

const CheckMark = () => <FaCheck size={11} color="white" />;

const InspectedStructuresTable = ({ date, structures }) => {
  console.log(structures);
  const { selectedStructure, setSelectedStructure } = useSelectedStructure();
  const { showLoading, hideLoading, showSuccess } = useLoading();

  return (
    <>
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
        {/* <h3 className=" font-light text-gray-500">
          {date.toLocaleDateString()}
        </h3> */}

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
      <div className="flex flex-col gap-0 border">
        <div className=" overflow-auto overflow-x-auto w-full">
          <Table striped className="">
            <TableHead className="sticky">
              <TableHeadCell>Map Section</TableHeadCell>
              <TableHeadCell>Map & Project #</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
              <TableHeadCell>Time</TableHeadCell>
            </TableHead>
            <TableBody className="divide-y">
              {structures.map((structure, index) => (
                <TableRow
                  key={index}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <TableCell
                    className=" cursor-pointer"
                    onClick={() => setSelectedStructure(structure)}
                  >
                    <h4 className="font-medium text-base text-dark-blue-700 dark:text-white">
                      {structure.attributes.mapSection}
                    </h4>
                    <p className=" text-xs">{structure.attributes.type}</p>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="leading-none font-medium text-xs text-gray-900">
                        {structure?.attributes.inspection.data?.attributes
                          .name || ""}
                      </span>
                      <span className="leading-none font-medium text-xs text-gray-900">
                        {structure?.attributes.inspection.data?.attributes
                          .projectId || ""}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StructureStatusBadge
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
