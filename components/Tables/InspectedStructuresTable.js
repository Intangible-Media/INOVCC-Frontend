"use server";

import { formatToReadableTime } from "../../utils/strings";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";

const InspectedStructuresTable = ({ structures }) => (
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
            <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
              {structure.attributes.mapSection}
            </TableCell>
            <TableCell> {structure.attributes.type}</TableCell>
            <TableCell> {structure.attributes.status}</TableCell>
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

export default InspectedStructuresTable;
