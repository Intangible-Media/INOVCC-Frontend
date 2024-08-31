"use client";

import { useState } from "react";
import { useSelectedStructure } from "../../context/SelectedStructureContext";
import {
  Table,
  TableBody,
  TableHead,
  TableHeadCell,
  TableRow,
  TextInput,
  TableCell,
} from "flowbite-react";
import StructureStatusBadge from "../StructureStatusBadge";
import { FaCheck } from "react-icons/fa6";

const CheckMark = () => <FaCheck size={11} color="white" />;

const InspectedStructuresTable = ({ structures }) => {
  const { selectedStructure, setSelectedStructure } = useSelectedStructure();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStructures = structures.filter((structure) =>
    structure.attributes.mapSection
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex justify-between">
        <TextInput
          placeholder="Search Sturctures..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Smooth transition wrapper */}
      <div
        className={`transition-opacity duration-300 ease-in-out ${
          searchTerm === "" ? "opacity-0 h-0" : "opacity-100 h-auto"
        }`}
      >
        {searchTerm !== "" && (
          <div className="flex flex-col gap-0 border">
            <div className="max-h-[250px] overflow-auto overflow-x-auto w-full">
              <Table striped className="">
                <TableHead className="sticky">
                  <TableHeadCell>Name</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                </TableHead>
                <TableBody className="divide-y">
                  {filteredStructures.length > 0 ? (
                    filteredStructures.map((structure, index) => (
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
        )}
      </div>
    </>
  );
};

export default InspectedStructuresTable;
