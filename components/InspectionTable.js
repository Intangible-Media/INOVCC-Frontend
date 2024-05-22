"use client";

import { Checkbox, Table, Progress, Button } from "flowbite-react";
import { useState, useEffect } from "react";
import { Dropdown } from "flowbite-react";
import Link from "next/link";
import "mapbox-gl/dist/mapbox-gl.css";

const ITEMS_PER_PAGE = 5; // Define how many items you want per page

const ElipseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
  >
    <path
      d="M9.99992 5.5C10.9204 5.5 11.6666 4.82843 11.6666 4C11.6666 3.17157 10.9204 2.5 9.99992 2.5C9.07944 2.5 8.33325 3.17157 8.33325 4C8.33325 4.82843 9.07944 5.5 9.99992 5.5Z"
      fill="#1F2A37"
    />
    <path
      d="M9.99992 11.5C10.9204 11.5 11.6666 10.8284 11.6666 10C11.6666 9.17157 10.9204 8.5 9.99992 8.5C9.07944 8.5 8.33325 9.17157 8.33325 10C8.33325 10.8284 9.07944 11.5 9.99992 11.5Z"
      fill="#1F2A37"
    />
    <path
      d="M9.99992 17.5C10.9204 17.5 11.6666 16.8284 11.6666 16C11.6666 15.1716 10.9204 14.5 9.99992 14.5C9.07944 14.5 8.33325 15.1716 8.33325 16C8.33325 16.8284 9.07944 17.5 9.99992 17.5Z"
      fill="#1F2A37"
    />
  </svg>
);

export default function InspectionTable({ inspectionData }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInspectionData, setFilteredInspectionData] =
    useState(inspectionData);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedData, setPaginatedData] = useState([]);

  const getInspectionProgress = (inspection) => {
    if (
      !inspection ||
      !inspection.attributes ||
      !inspection.attributes.structures ||
      !inspection.attributes.structures.data
    ) {
      return 0; // Return 0 if the data is not available
    }

    const totalStructures = inspection.attributes.structures.data.length;
    const inspectedStructuresCount =
      inspection.attributes.structures.data.filter(
        (structure) => structure.attributes.status === "Inspected"
      ).length;

    if (totalStructures === 0) {
      return 0; // Avoid division by zero
    }

    const inspectedPercentage =
      (inspectedStructuresCount / totalStructures) * 100;
    return Math.round(inspectedPercentage); // Round to the nearest whole number
  };

  const getInspectionProgressClasses = (inspection) => {
    const progressPercentage = getInspectionProgress(inspection);

    if (progressPercentage < 34) return "bg-red-100 text-red-800";
    if (progressPercentage > 33 && progressPercentage <= 65)
      return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  useEffect(() => {
    // Function to perform searching and filtering
    const searchAndFilterData = () => {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filteredData = inspectionData.filter((inspection) => {
        // Assuming you want to filter by the inspection's name or client's name
        return (
          inspection.attributes.name.toLowerCase().includes(lowercasedQuery) ||
          inspection.attributes.client.data.attributes.name
            .toLowerCase()
            .includes(lowercasedQuery)
        );
      });

      // Reset to the first page when search query changes
      setCurrentPage(1);
      // Set filtered data
      setFilteredInspectionData(filteredData);
    };

    searchAndFilterData();
  }, [searchQuery, inspectionData]);

  useEffect(() => {
    // Function to perform pagination
    const paginateData = () => {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      setPaginatedData(filteredInspectionData.slice(start, end));
    };

    paginateData();
  }, [currentPage, filteredInspectionData]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const totalPages = Math.ceil(filteredInspectionData.length / ITEMS_PER_PAGE);

  // Function to highlight the search query matches
  const highlightMatch = (text, query) => {
    // Ensure text is a string
    const stringText = text?.toString() || "";

    if (!query) return stringText;

    const parts = stringText.split(new RegExp(`(${query})`, "gi"));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={index} className="bg-yellow-200">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="mx-auto max-w-screen-2xl p-6">
      <div className="bg-white dark:bg-gray-800 relative sm:rounded-lg overflow-hidden">
        <div className="border-b dark:border-gray-700">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 flex items-center space-x-3">
              <h5 className="text-xl font-bold dark:text-white mb-3">
                All Projects
              </h5>
            </div>
          </div>
          <div className="flex flex-col-reverse md:flex-row justify-between md:space-x-4 pb-4">
            <div className="w-full lg:w-2/3 flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center">
              <form className="w-full md:max-w-sm flex-1 md:mr-4">
                <label
                  htmlFor="default-search"
                  className="text-sm font-medium text-gray-900 sr-only dark:text-white"
                >
                  Search
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      aria-hidden="true"
                      className="w-4 h-4 text-gray-500 dark:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="search"
                    id="default-search"
                    className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder="Search..."
                    required=""
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
              </form>
              <div className="flex items-center space-x-4 hidden">
                <div>
                  <Button
                    id="filterDropdownButton"
                    data-dropdown-toggle="filterDropdown"
                    type="Button"
                    className="w-full md:w-auto flex items-center justify-center px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      className="h-4 w-4 mr-2 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                      />
                    </svg>
                    Filter
                    <svg
                      className="-mr-1 ml-1.5 w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        clipRule="evenodd"
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      />
                    </svg>
                  </Button>
                  <div
                    id="filterDropdown"
                    className="z-10 hidden p-3 bg-white rounded-lg shadow w-56 dark:bg-gray-700"
                  >
                    <h6 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      By status
                    </h6>
                    <ul
                      className="space-y-2 text-sm"
                      aria-labelledby="filterDropdownButton"
                    >
                      <li>
                        <label className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md px-1.5 py-1 w-full">
                          <input
                            type="checkbox"
                            defaultValue=""
                            className="w-4 h-4 mr-2 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                          />
                          In progress
                        </label>
                      </li>
                      <li>
                        <label className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md px-1.5 py-1 w-full">
                          <input
                            type="checkbox"
                            defaultValue=""
                            defaultChecked=""
                            className="w-4 h-4 mr-2 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                          />
                          In review
                        </label>
                      </li>
                      <li>
                        <label className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md px-1.5 py-1 w-full">
                          <input
                            type="checkbox"
                            defaultValue=""
                            className="w-4 h-4 mr-2 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                          />
                          Completed
                        </label>
                      </li>
                      <li>
                        <label className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md px-1.5 py-1 w-full">
                          <input
                            type="checkbox"
                            defaultValue=""
                            className="w-4 h-4 mr-2 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                          />
                          Canceled
                        </label>
                      </li>
                    </ul>
                    <h6 className="mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      By number of users
                    </h6>
                    <ul
                      className="space-y-2 text-sm"
                      aria-labelledby="dropdownDefault"
                    >
                      <li>
                        <label className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md px-1.5 py-1 w-full">
                          <input
                            type="checkbox"
                            defaultValue=""
                            defaultChecked=""
                            className="w-4 h-4 mr-2 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                          />
                          5-10 peoples
                        </label>
                      </li>
                      <li>
                        <label className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md px-1.5 py-1 w-full">
                          <input
                            type="checkbox"
                            defaultValue=""
                            className="w-4 h-4 mr-2 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                          />
                          10+ peoples
                        </label>
                      </li>
                      <li>
                        <label className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md px-1.5 py-1 w-full">
                          <input
                            type="checkbox"
                            defaultValue=""
                            className="w-4 h-4 mr-2 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                          />
                          More than 10 peoples
                        </label>
                      </li>
                    </ul>
                    <a
                      href="#"
                      className="flex items-center text-sm font-medium text-primary-600 dark:text-primary-500 hover:underline mt-4 ml-1.5"
                    >
                      Apply to all projects
                    </a>
                  </div>
                </div>
                <div>
                  <div
                    id="configurationDropdown"
                    className="hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600"
                  >
                    <ul
                      className="py-1 text-sm text-gray-700 dark:text-gray-200"
                      aria-labelledby="configurationDropdownButton"
                    >
                      <li>
                        <a
                          href="#"
                          className="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >
                          By Category
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >
                          By Brand
                        </a>
                      </li>
                    </ul>
                    <div className="py-1">
                      <a
                        href="#"
                        className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                      >
                        Reset
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="pb-3 flex flex-wrap hidden">
          <div className="hidden md:flex items-center text-sm font-medium text-gray-900 dark:text-white mr-4 my-3">
            Show only:
          </div>
          <div className="flex flex-wrap">
            <div className="flex items-center mt-3 mr-4">
              <input
                id="all-tasks"
                type="radio"
                defaultValue=""
                name="show-only"
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="all-tasks"
                className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                All
              </label>
            </div>
            <div className="flex items-center mr-4 mt-3">
              <input
                id="completed"
                type="radio"
                defaultValue=""
                name="show-only"
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="completed"
                className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Completed tasks
              </label>
            </div>
            <div className="flex items-center mr-4 mt-3">
              <input
                id="in-progress"
                type="radio"
                defaultValue=""
                name="show-only"
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="in-progress"
                className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Tasks in progress
              </label>
            </div>
            <div className="flex items-center mr-4 mt-3">
              <input
                id="in-review"
                type="radio"
                defaultValue=""
                name="show-only"
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="in-review"
                className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Tasks in review
              </label>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto ">
          <Table hoverable striped>
            <Table.Head>
              <Table.HeadCell>Inspection</Table.HeadCell>
              <Table.HeadCell>Client</Table.HeadCell>
              <Table.HeadCell>Structures</Table.HeadCell>
              <Table.HeadCell>Progress</Table.HeadCell>
              <Table.HeadCell>
                <span className="sr-only">Edit</span>
              </Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {paginatedData.map((inspection, index) => (
                <Table.Row
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  key={`${inspection.id}-${index}`}
                >
                  <Table.Cell className="font-medium text-gray-900 dark:text-white">
                    {highlightMatch(inspection.attributes.name, searchQuery)}
                  </Table.Cell>
                  <Table.Cell>
                    {highlightMatch(
                      inspection.attributes.client.data.attributes.name,
                      searchQuery
                    )}
                  </Table.Cell>
                  <Table.Cell className="text-left">
                    {highlightMatch(
                      inspection.attributes.structures.data.length,
                      searchQuery
                    )}
                  </Table.Cell>

                  <Table.Cell>
                    {/* <span
                      className={`${getInspectionProgressClasses(
                        inspection
                      )} inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-md`}
                    >
                      {getInspectionProgress(inspection)}%
                    </span> */}
                    <Progress
                      progress={getInspectionProgress(inspection)}
                      textLabel=""
                      size="lg"
                      color="green"
                      labelProgress
                      labelText
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Dropdown
                      inline
                      label=""
                      placement="top"
                      dismissOnClick={false}
                      renderTrigger={() => (
                        <span>
                          <ElipseIcon />
                        </span>
                      )}
                    >
                      <Dropdown.Item>
                        <div className="flex items-center">
                          <span>
                            <Link href={`/inspections/${inspection.id}`}>
                              View
                            </Link>
                          </span>{" "}
                        </div>
                      </Dropdown.Item>
                    </Dropdown>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
        <div className="flex justify-center items-center pt-5">
          <div className="flex items-center -space-x-px h-8 text-sm">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(currentPage - 1);
              }}
              className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 rounded-s-lg ${
                currentPage === 1
                  ? "text-gray-400 bg-gray-200 cursor-not-allowed"
                  : "text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700"
              } dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white`}
              disabled={currentPage === 1}
            >
              <span className="sr-only">Previous</span>
              <svg
                className="w-2.5 h-2.5 rtl:rotate-180"
                aria-hidden="true"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 1 1 5l4 4"
                />
              </svg>
            </a>

            {Array.from({ length: totalPages }, (_, i) => (
              <a
                key={i}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(i + 1);
                }}
                className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 ${
                  currentPage === i + 1
                    ? "text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-gray-700 dark:text-white"
                    : "text-gray-500 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                }`}
              >
                {i + 1}
              </a>
            ))}

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(currentPage + 1);
              }}
              className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 rounded-e-lg ${
                currentPage === totalPages
                  ? "text-gray-400 bg-gray-200 cursor-not-allowed"
                  : "text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700"
              } dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white`}
              disabled={currentPage === totalPages}
            >
              <span className="sr-only">Next</span>
              <svg
                className="w-2.5 h-2.5 rtl:rotate-180"
                aria-hidden="true"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

const TableRow = ({
  id,
  taskName,
  status,
  statusColor,
  images,
  progress,
  time,
  date,
  actions,
}) => {
  const progressStyle = { width: `${progress}%` };

  return (
    <tr className="border-b dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
      <td className="px-4 py-2 w-4">
        <div className="flex items-center">
          <input
            id={`checkbox-${id}`}
            type="checkbox"
            className="w-4 h-4 text-primary-600 bg-gray-100 rounded border-gray-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor={`checkbox-${id}`} className="sr-only">
            checkbox
          </label>
        </div>
      </td>
      <th
        scope="row"
        className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white"
      >
        {taskName}
      </th>
      <td className="px-4 py-2">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-800 dark:bg-${statusColor}-700 dark:text-${statusColor}-100`}
        >
          {status}
        </span>
      </td>
      <td className="px-4 py-2">
        <div className="flex -space-x-4 w-28">
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Avatar ${index}`}
              className="w-10 h-10 border-2 border-white rounded-full dark:border-gray-800"
            />
          ))}
        </div>
      </td>
      <td className="px-4 py-2">
        <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
          <div
            className="bg-primary-600 h-1.5 rounded-full"
            style={progressStyle}
          />
        </div>
      </td>
      <td className="px-4 py-2">{time}</td>
      <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
        {date}
      </td>
      <td className="px-4 py-2">{/* Action Buttons or links */}</td>
    </tr>
  );
};
