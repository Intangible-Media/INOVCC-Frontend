"use client";

import { Checkbox, Table, Progress, Button, Badge } from "flowbite-react";
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

export default function InvoiceTable({ invoiceData }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInvoiceData, setFilteredInvoiceData] = useState(invoiceData);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedData, setPaginatedData] = useState([]);

  useEffect(() => {
    // Function to perform searching and filtering
    const searchAndFilterData = () => {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filteredData = invoiceData.filter((invoice) => {
        // Assuming you want to filter by the invoice's name or client's name
        return (
          invoice.attributes.name.toLowerCase().includes(lowercasedQuery) ||
          invoice.attributes.client.data.attributes.name
            .toLowerCase()
            .includes(lowercasedQuery)
        );
      });

      // Reset to the first page when search query changes
      setCurrentPage(1);
      // Set filtered data
      setFilteredInvoiceData(filteredData);
    };

    searchAndFilterData();
  }, [searchQuery, invoiceData]);

  useEffect(() => {
    // Function to perform pagination
    const paginateData = () => {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      setPaginatedData(filteredInvoiceData.slice(start, end));
    };

    paginateData();
  }, [currentPage, filteredInvoiceData]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const totalPages = Math.ceil(filteredInvoiceData.length / ITEMS_PER_PAGE);

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
    <div className="w-full">
      <div className="bg-white dark:bg-gray-800 relative sm:rounded-lg overflow-hidden">
        <div className="border-b dark:border-gray-700">
          <div className="flex flex-col-reverse md:flex-row justify-between md:space-x-4 pb-4">
            <div className="w-full flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center">
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
            </div>
          </div>

          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 flex items-center space-x-3">
              <h5 className="text-xl font-bold dark:text-white mb-3">
                Invoices
              </h5>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto ">
          <Table hoverable striped>
            <Table.Head>
              <Table.HeadCell>Invoice</Table.HeadCell>
              <Table.HeadCell>Price</Table.HeadCell>

              <Table.HeadCell className=" text-right">Progress</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {paginatedData.map((invoice, index) => (
                <Table.Row
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  key={`${invoice.id}-${index}`}
                >
                  <Table.Cell className="font-medium text-gray-900 dark:text-white">
                    <Link
                      href={`/billing/${invoice.id}`}
                      className="text-dark-blue-600 hover:underline"
                    >
                      {highlightMatch(invoice.attributes.name, searchQuery)}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>{highlightMatch(9898, searchQuery)}</Table.Cell>

                  <Table.Cell>
                    {invoice.attributes.paid ? (
                      <Badge className="w-fit ml-auto" color="success">
                        Paid
                      </Badge>
                    ) : (
                      <Badge className="w-fit ml-auto" color="failure">
                        Outstanding
                      </Badge>
                    )}
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
