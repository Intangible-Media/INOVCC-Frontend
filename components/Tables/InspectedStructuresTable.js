"use client";

import { formatToReadableTime } from "../../utils/strings";
import { useSelectedStructure } from "../../context/SelectedStructureContext";
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

const CheckMark = () => <FaCheck size={11} color="white" />;

const InspectedStructuresTable = ({ structures }) => {
  const { selectedStructure, setSelectedStructure } = useSelectedStructure();

  return (
    <div className="h-[400px] overflow-auto overflow-x-auto w-full">
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
              <TableCell> {structure.attributes.type}</TableCell>
              <TableCell>
                {structure.attributes.status === "Inspected" &&
                  structure.attributes.adminStatus === "Uploaded" && (
                    <div className="inline-block">
                      <Badge
                        icon={CheckMark}
                        className="bg-dark-green text-xs h-fit text-white rounded-md px-2 py-0.5 flex-row-reverse "
                      >
                        {structure.attributes.adminStatus}
                      </Badge>
                    </div>
                  )}

                {structure.attributes.status === "Inspected" &&
                  structure.attributes.adminStatus !== "Uploaded" && (
                    <Badge className=" inline-block" color="green">
                      {structure.attributes.status}
                    </Badge>
                  )}

                {structure.attributes.status !== "Inspected" && (
                  <Badge className=" inline-block" color="red">
                    {structure.attributes.status}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {" "}
                {formatToReadableTime(structure.attributes.inspectionDate)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InspectedStructuresTable;
