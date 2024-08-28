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

const CheckMark = () => <FaCheck size={11} color="white" />;

const InspectedStructuresTable = ({ date, structures }) => {
  console.log(structures);
  const { selectedStructure, setSelectedStructure } = useSelectedStructure();
  const { showLoading, hideLoading, showSuccess } = useLoading();

  return (
    <>
      <div className="flex flex-col md:flex-row gap-2 justify-between">
        <h3 className="text-md font-bold dark:text-white my-auto">
          Inspected Structures{" - "}
          <span className=" font-light text-gray-500">
            {date.toLocaleDateString()}
          </span>
        </h3>
        <Button
          className="bg-dark-blue-700 text-white"
          size={"xs"}
          onClick={async (e) => {
            const inspectedStructures = structures.filter((structure) => {
              const { status, inspectionDate } = structure.attributes;

              if (status === "Inspected" && inspectionDate) {
                const inspectionDateObj = new Date(inspectionDate);

                // Check if inspectionDate is today
                return (
                  inspectionDateObj.getFullYear() === date.getFullYear() &&
                  inspectionDateObj.getMonth() === date.getMonth() &&
                  inspectionDateObj.getDate() === date.getDate()
                );
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
                formattedStructures
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
        <div className="max-h-[400px] overflow-auto overflow-x-auto w-full">
          <Table striped className="">
            <TableHead className="sticky">
              <TableHeadCell>Name</TableHeadCell>
              <TableHeadCell>Type</TableHeadCell>
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
                    className="whitespace-nowrap font-medium text-dark-blue-700 dark:text-white cursor-pointer"
                    onClick={() => setSelectedStructure(structure)}
                  >
                    {structure.attributes.mapSection}
                  </TableCell>
                  <TableCell>
                    <p className="w-24">{structure.attributes.type}</p>
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
