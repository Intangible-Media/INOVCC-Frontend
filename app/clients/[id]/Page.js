"use client";

import React from "react";
import { Table } from "flowbite-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import qs from "qs";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const docDefinition = {
  content: [],

  styles: {
    header: {
      fontSize: 18,
      bold: true,
      margin: [0, 0, 0, 10],
    },
    subheader: {
      fontSize: 16,
      bold: true,
      margin: [0, 10, 0, 5],
    },
    tableBody: {
      fontSize: 12,
      margin: [5, 10],
    },
    tableExample: {
      margin: [0, 5, 0, 15],
      paddingLeft: 100,
      paddingRight: 100,
    },
    tableOpacityExample: {
      margin: [0, 5, 0, 15],
      fillColor: "blue",
      fillOpacity: 0.3,
    },
    tableHeader: {
      bold: true,
      fontSize: 13,
      color: "black",
      margin: [5, 10],
    },
  },
  defaultStyle: {
    // alignment: 'justify'
  },
  patterns: {
    stripe45d: {
      boundingBox: [1, 1, 4, 4],
      xStep: 3,
      yStep: 3,
      pattern: "1 w 0 1 m 4 5 l s 2 0 m 5 3 l s",
    },
  },
};

export default function Page({ params }) {
  const { data: session, loading } = useSession();
  const [structures, setStructures] = useState([]);

  const query = qs.stringify(
    {
      filters: {
        $and: [
          {
            inspection: {
              client: {
                id: {
                  $eq: params.id, // Assuming params.id is your client's ID
                },
              },
            },
          },
          {
            status: {
              $eq: "Inspected", // Filter structures by "inspected" status
            },
          },
        ],
      },
      populate: ["inspection.client"], // Populate the inspection and its client
    },
    {
      encodeValuesOnly: true,
    }
  );

  const fetchData = async () => {
    if (session?.accessToken) {
      try {
        const response = await axios.get(
          `http://localhost:1337/api/structures?${query}`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        console.log(response.data.data);
        setStructures(response.data.data);
      } catch (error) {
        console.error("Error fetching data", error.response || error);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [session]);

  useEffect(() => {
    // Function to group structures by type
    const groupByType = (structures) => {
      return structures.reduce((acc, structure) => {
        const type = structure.attributes.type;
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(structure);
        return acc;
      }, {});
    };

    // Group structures by type
    const groupedStructures = groupByType(sortedStructures);

    // Function to create a table for each type
    const createTableForType = (structures, type) => {
      return [
        {
          text: type,
          fontSize: 14,
          bold: true,
          margin: [0, 0, 0, 18],
        },
        {
          table: {
            headerRows: 1,
            paddingLeft: 8,
            paddingRight: 8,
            widths: [40, "auto", 100, "*", "*"],
            body: [
              // This is the header row
              [
                {
                  text: "ID",
                  style: "tableHeader",
                  fillColor: "#f9fafb",
                  border: [false, false, false, false],
                },
                {
                  text: "Map Section",
                  style: "tableHeader",
                  fillColor: "#f9fafb",
                  border: [false, false, false, false],
                },
                {
                  text: "Type",
                  style: "tableHeader",
                  fillColor: "#f9fafb",
                  border: [false, false, false, false],
                },
                {
                  text: "Inspected",
                  style: "tableHeader",
                  fillColor: "#f9fafb",
                  border: [false, false, false, false],
                },
                {
                  text: "Date",
                  style: "tableHeader",
                  fillColor: "#f9fafb",
                  border: [false, false, false, false],
                },
              ],
              // Add rows for the structures of this type
              ...structures.map((structure, index) => {
                let cellBackgroundColor =
                  index % 2 == 0 ? "#ffffff" : "#f9fafb";
                return [
                  {
                    text: structure.id,
                    style: "tableBody",
                    fillColor: cellBackgroundColor,
                    border: [false, false, false, false],
                  },
                  {
                    text: structure.attributes.mapSection,
                    style: "tableBody",
                    fillColor: cellBackgroundColor,
                    border: [false, false, false, false],
                  },
                  {
                    text: type,
                    style: "tableBody",
                    fillColor: cellBackgroundColor,
                    border: [false, false, false, false],
                  },
                  {
                    text: structure.attributes.status,
                    style: "tableBody",
                    fillColor: cellBackgroundColor,
                    border: [false, false, false, false],
                  },
                  {
                    text: structure.attributes.inspectionDate,
                    style: "tableBody",
                    fillColor: cellBackgroundColor,
                    border: [false, false, false, false],
                  },
                ];
              }),
            ],
          },
        },
        {
          text: "",
          fontSize: 14,
          bold: true,
          pageBreak: "after",
          margin: [0, 0, 0, 8],
        },
      ];
    };

    // Create a table for each type
    docDefinition.content = Object.keys(groupedStructures).map((type) =>
      createTableForType(groupedStructures[type], type)
    );
  }, [structures]);

  const generatePdf = () => {
    pdfMake.createPdf(docDefinition).open();
  };

  const sortedStructures = [...structures].sort((a, b) =>
    a.attributes.type.localeCompare(b.attributes.type)
  );

  return (
    <>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex md:col-span-1 flex-col border-gray-300 dark:border-gray-600 bg-white gap-4 p-8 rounded-lg">
          <button
            onClick={generatePdf}
            className="bg-cyan-500 text-white font-bold py-2 px-4 rounded"
          >
            Generate PDF
          </button>
        </div>
        <div className="flex flex-col border-gray-300 dark:border-gray-600 bg-white gap-4 p-8 rounded-lg">
          <div className="invoice-viewer overflow-x-auto">
            <Table striped hoverable>
              <Table.Head>
                <Table.HeadCell>Structure ID</Table.HeadCell>
                <Table.HeadCell>Map Section</Table.HeadCell>
                <Table.HeadCell>Type</Table.HeadCell>
                <Table.HeadCell>Inspection Date</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {sortedStructures.map((structure) => (
                  <Table.Row
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                    key={structure.id}
                  >
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {structure.id}
                    </Table.Cell>
                    <Table.Cell>{structure.attributes.mapSection}</Table.Cell>
                    <Table.Cell>{structure.attributes.type}</Table.Cell>
                    <Table.Cell>
                      {structure.attributes.inspectionDate}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}
