"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeadCell,
  Button,
  TableRow,
  TextInput,
  TableCell,
} from "flowbite-react";
import StructureStatusBadge from "../StructureStatusBadge";
import { FaCheck } from "react-icons/fa6";

const CheckMark = () => <FaCheck size={11} color="white" />;

const InspectedStructuresTable = ({ structures }) => {
  console.log("inside function", structures);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStructures = structures.filter((structure) =>
    structure.attributes.mapSection
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between">
        <TextInput
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        <Button>D</Button>
      </div>

      {/* Smooth transition wrapper */}
      <div className={`transition-opacity duration-300 ease-in-out`}>
        <div className="flex flex-col gap-0 ">
          <div className="max-h-[600px] overflow-auto relative">
            <Table striped className="relative">
              <TableHead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
                <TableHeadCell>Name</TableHeadCell>
                <TableHeadCell>Type</TableHeadCell>
                <TableHeadCell>longitude</TableHeadCell>
                <TableHeadCell>latitude</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
              </TableHead>
              <TableBody className="divide-y">
                {filteredStructures.length > 0 ? (
                  filteredStructures.map((structure, index) => (
                    <TableRow
                      key={index}
                      className="bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <TableCell className="whitespace-nowrap font-medium text-dark-blue-700 dark:text-white cursor-pointer">
                        {structure.attributes.mapSection}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-medium  dark:text-white cursor-pointer">
                        {structure.attributes.type}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-medium  dark:text-white cursor-pointer">
                        {structure.attributes.longitude}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-medium  dark:text-white cursor-pointer">
                        {structure.attributes.latitude}
                      </TableCell>
                      <TableCell>
                        <StructureStatusBadge
                          status={structure.attributes.status}
                          adminStatus={structure.attributes.adminStatus}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan="2" className="text-center">
                      No structures found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectedStructuresTable;
