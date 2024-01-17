"use client";

import React from "react";
import { Table, Button, TextInput, Select, Alert } from "flowbite-react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import qs from "qs";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import dynamic from "next/dynamic";
import { MdFileDownload } from "react-icons/md";
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const docDefinition = {
  content: [
    // Header content
    {
      columns: [
        {
          // Left side of the header (Company logo and tagline)
          stack: [
            {
              image: "logo",
            },
            {
              text: "Your Tagline or Slogan",
              style: "tagline",
            },
          ],
        },
        {
          // Right side of the header (Invoice details)
          stack: [
            {
              text: "Invoice",
              style: "header",
            },
            {
              text: "Invoice Number: #27998324",
              style: "subheader",
            },
            {
              text: "Invoice Date: 2023-12-05",
              style: "subheader",
            },
            {
              text: "Due Date: 2024-01-05",
              style: "subheader",
            },
          ],
          alignment: "right",
        },
      ],
      columnGap: 10,
    },
    {
      // Address and contact information
      text: [
        "Address: 123 Business Road, City, Country\n",
        "Phone: (123) 456-7890 | Email: contact@example.com",
      ],
      style: "subheader",
      margin: [0, 10, 0, 20], // Top margin
    },
  ],

  images: {
    logo: {
      url: "http://localhost:3000/inovcc-logo.png",
    },
  },

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

    tableHeader: {
      bold: true,
      fontSize: 13,
      color: "black",
      margin: [5, 10],
    },
    tagline: {
      fontSize: 10,
      color: "#4B5563",
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
  const router = useRouter();

  const { data: session, loading } = useSession();
  const [structures, setStructures] = useState([]);
  const [groupedStructures, setGroupedStructures] = useState({});
  const [selectedClientId, setSelectedClientId] = useState(); // State to store the selected client ID
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [clients, setClients] = useState([]);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showPublishButton, setShowPublishButton] = useState(false);
  const [clientPricing, setClientPricing] = useState();
  const [client, setClient] = useState({
    name: "",
    address: "",
  });

  const chartOptions = {
    chart: {
      width: 380,
      type: "donut",
      offsetX: -40, // Adjust this value as needed to align left
      parentHeightOffset: 0,
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    labels: Object.keys(groupedStructures).map((type) => {
      return type;
    }),
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
            offsetX: -50, // Adjust for responsiveness
          },
          legend: {
            show: false,
          },
        },
      },
    ],
    legend: {
      show: true,
      position: "right",
      offsetY: 0,
    },
  };

  const query = qs.stringify(
    {
      filters: {
        $and: [
          {
            inspection: {
              client: {
                id: {
                  $eq: selectedClientId, // Assuming params.id is your client's ID
                },
              },
            },
          },
          {
            status: {
              $eq: "Inspected", // Filter structures by "inspected" status
            },
          },
          {
            inspectionDate: {
              $gte: startDate, // Start of the date range
              $lte: endDate, // End of the date range
            },
          },
        ],
      },
    },
    {
      encodeValuesOnly: true,
    }
  );

  const getInvoicehData = async () => {
    if (session?.accessToken) {
      try {
        const structuresResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/structures?${query}`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        const clientResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/clients/${selectedClientId}`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );
        setStructures(structuresResponse.data.data);
        setClientPricing(clientResponse.data.data.attributes.structurePricing);
        setClient(clientResponse.data.data.attributes);
      } catch (error) {
        console.error("Error fetching data", error.response || error);
      }
    }
  };

  const createInvoice = async () => {
    if (session?.accessToken) {
      try {
        const invoiceData = {
          data: {
            name: `testing-${Date.now()}`,
            client: selectedClientId,
            structures: structures.map((structure) => structure.id),
            paid: false,
            structurePricing: clientPricing,
          },
        };

        const invoiceResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/invoices`,
          invoiceData,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        setShowSuccessAlert(true);

        setTimeout(() => {
          router.push(`/clients/invoices/${invoiceResponse.data.data.id}`, {
            scroll: false,
          });
        }, 1000);
      } catch (error) {
        console.error("Error fetching data", error.response || error);
      }
    }
  };

  const generatePdf = () => {
    pdfMake.createPdf(docDefinition).open();
  };

  const sortedStructures = [...structures].sort((a, b) =>
    a.attributes.type.localeCompare(b.attributes.type)
  );

  useEffect(() => {
    if (structures.length) {
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

      if (structures.length) {
        // Sort structures if needed
        const sortedStructures = [...structures].sort((a, b) =>
          a.attributes.type.localeCompare(b.attributes.type)
        );

        // Group structures by type
        const newGroupedStructures = groupByType(sortedStructures);

        // Update the state with the new grouped structures
        setGroupedStructures(newGroupedStructures);

        // Function to create a table for each type
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

        // Create a table for each type in the PDF document definition
        docDefinition.content.push(
          Object.keys(newGroupedStructures).map((type) =>
            createTableForType(newGroupedStructures[type], type)
          )
        );
      }
    } else {
      setGroupedStructures({});
    }
  }, [structures]);

  useEffect(() => {
    if (session?.accessToken) {
      try {
        const getAllClients = async () => {
          const clientsResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/clients`,
            {
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
              },
            }
          );

          setClients(clientsResponse.data.data);
        };

        getAllClients();
      } catch (error) {
        console.error(error);
      }
    }
  }, [session]);

  useEffect(() => {
    console.log(clientPricing);

    function areAllPricesGreaterThanZero(clientPricing) {
      if (!clientPricing || typeof clientPricing !== "object") {
        return false; // Return false if clientPricing is null, undefined, or not an object
      }
      return Object.values(clientPricing).every(
        (value) => value && value.price > 0
      );
    }

    console.log(areAllPricesGreaterThanZero(clientPricing));

    setShowPublishButton(areAllPricesGreaterThanZero(clientPricing));
  }, [clientPricing]);

  const StructuresPricingTable = () => {
    const redBackground = "bg-red-400 text-white";

    const checkIfValueExistOrIsZero = (type) => {
      const pricing =
        clientPricing[type.toLowerCase().replace(" ", "-")]?.price;

      if (pricing && pricing > 0) return "";

      return redBackground;
    };

    return (
      <>
        {Object.keys(groupedStructures).map((type, index) => (
          <Table.Row
            className={`bg-white dark:border-gray-700 dark:bg-gray-800 structure-table-row ${checkIfValueExistOrIsZero(
              type
            )}`}
            key={`${type}-${index}`}
          >
            <Table.Cell className="text-black">{type}</Table.Cell>
            <Table.Cell>
              <TextInput
                className="w-20 border-none border-0"
                placeholder="999"
                value={
                  clientPricing[type.toLowerCase().replace(" ", "-")]
                    ? clientPricing[type.toLowerCase().replace(" ", "-")].price
                    : 0
                }
                onChange={(e) =>
                  setClientPricing({
                    ...clientPricing,
                    [type.toLowerCase().replace(" ", "-")]: {
                      ...clientPricing[type.toLowerCase().replace(" ", "-")],
                      price: e.target.value,
                    },
                  })
                }
                required
              />
            </Table.Cell>
          </Table.Row>
        ))}
      </>
    );
  };

  return (
    <>
      {showSuccessAlert && (
        <Alert
          color="success"
          className="alert-bar"
          onDismiss={() => setShowSuccessAlert(false)}
        >
          <span className="font-medium">Successfully Created</span> Change a few
          things up and try submitting again.
        </Alert>
      )}
      <div className="grid grid-cols-5 gap-4 mb-4">
        <div className="flex flex-col col-span-3 border-gray-300 dark:border-gray-600 bg-white gap-4">
          <div className="invoice-viewer overflow-x-auto shadow-md">
            <header className="mb-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col">
                    <img
                      src="/inovcc-logo.png"
                      alt="Company Logo"
                      className="h-12 mb-4"
                    />
                    <div>
                      <p className="text-sm text-gray-600">
                        Your Tagline or Slogan
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg text-gray-700 font-semibold">Invoice</p>
                  <p className="text-sm text-gray-600">
                    Invoice Number: #27998324
                  </p>
                  <p className="text-sm text-gray-600">
                    Invoice Date: 2023-12-05
                  </p>
                  <p className="text-sm text-gray-600">Due Date: 2024-01-05</p>
                </div>
              </div>
              <div className="mt-4 border-t pt-4">
                <p className="text-sm text-gray-600">
                  Address: 123 Business Road, City, Country
                </p>
                <p className="text-sm text-gray-600">
                  Phone: (123) 456-7890 | Email: contact@example.com
                </p>
              </div>
            </header>

            <section className="mb-10">
              <p className="text-lg text-gray-700 font-semibold">Bill To:</p>
              <p className="text-sm text-gray-600">{client.name}</p>
              <p className="text-sm text-gray-600">{client.address}</p>
            </section>

            <section className="mb-6">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="text-left py-2">Type of Structure</th>
                    <th className="text-right py-2">Quantity</th>
                    <th className="text-right py-2">Unit Price</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Repeat for each item */}
                  {Object.keys(groupedStructures).map((type, index) => (
                    <tr key={`${type}-${index}-${index}`}>
                      <td className="py-3">{type}</td>
                      <td className="text-right py-3">
                        {groupedStructures[type].length}
                      </td>
                      <td className="text-right py-3">
                        $
                        {
                          /* {clientPricing ? clientPricing[type].price : ""} */
                          clientPricing[type.toLowerCase().replace(" ", "-")] &&
                            clientPricing[type.toLowerCase().replace(" ", "-")]
                              .price
                        }
                      </td>
                      <td className="text-right py-3">
                        $
                        {clientPricing[type.toLowerCase().replace(" ", "-")] &&
                          clientPricing[type.toLowerCase().replace(" ", "-")]
                            .price * groupedStructures[type].length}
                      </td>
                    </tr>
                  ))}

                  {/* End of Repeat */}
                </tbody>
              </table>
            </section>

            <section className="p-0 text-right mb-20">
              <p className="text-sm">Subtotal: $100.00</p>
              <p className="text-sm">Total: $110.00</p>
            </section>

            {Object.keys(groupedStructures).map((type, index) => {
              return (
                <div key={`invoice-${type}-${index}`}>
                  <p className="flex items-center gap-2 text-lg font-semibold mb-4 mr-auto">
                    {type}
                  </p>
                  <Table striped hoverable key={type} className="mb-10">
                    <Table.Head>
                      <Table.HeadCell>ID</Table.HeadCell>
                      <Table.HeadCell>Map Section</Table.HeadCell>
                      <Table.HeadCell>Type</Table.HeadCell>
                      <Table.HeadCell>Inspection Date</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y">
                      {groupedStructures[type].map((structure) => (
                        <Table.Row
                          className="bg-white dark:border-gray-700 dark:bg-gray-800"
                          key={structure.id}
                        >
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                            {structure.id}
                          </Table.Cell>
                          <Table.Cell>
                            {structure.attributes.mapSection}
                          </Table.Cell>
                          <Table.Cell>{structure.attributes.type}</Table.Cell>
                          <Table.Cell>
                            {structure.attributes.inspectionDate}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </div>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 col-span-2 h-fit-content">
          <div className="invoice-control-panel flex md:col-span-2 flex-col border-gray-300 dark:border-gray-600 bg-white gap-4 p-8 rounded-lg overflow-auto">
            <div className="flex flex-col mb-4">
              <p className="flex items-center gap-2 text-md font-semibold mb-2 mr-auto">
                Client
              </p>
              <Select
                id="clients"
                className="w-full"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)} // Update the state when an option is selected
                required
              >
                <option key={"n/a"}>Select a Client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.attributes.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-row gap-4 mb-4">
              <div>
                <p className="flex items-center gap-2 text-md font-semibold mb-2 mr-auto">
                  Start Date
                </p>
                <DatePicker
                  className="w-full rounded-lg border border-1 border-gray-400"
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                />
              </div>
              <div>
                <p className="flex items-center gap-2 text-md font-semibold mb-2 mr-auto">
                  End Date
                </p>
                <DatePicker
                  className="w-full rounded-lg border border-1 border-gray-400"
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                />
              </div>{" "}
            </div>
            <div className="structure-table-container mb-4">
              <Table>
                <Table.Head className="sticky top-0 z-40">
                  <Table.HeadCell className="text-black">
                    Structure Type
                  </Table.HeadCell>
                  <Table.HeadCell className="text-black">Price</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  <StructuresPricingTable />
                </Table.Body>
              </Table>
            </div>

            <div className="flex gap-4">
              <Button
                className="bg-transparent border-cyan-400 border-2 text-black hover:bg-cyan-400"
                onClick={() => getInvoicehData()}
              >
                Load Data
              </Button>
              {showPublishButton && (
                <Button
                  className="bg-cyan-400"
                  onClick={(e) => createInvoice()}
                >
                  Publish
                </Button>
              )}
            </div>
          </div>
          <div className="flex md:col-span-2 flex-col border-gray-300 dark:border-gray-600 bg-white gap-4 p-8 rounded-lg pt-10">
            <ApexChart
              type="donut"
              options={chartOptions}
              series={Object.keys(groupedStructures).map((type) => {
                return groupedStructures[type].length;
              })}
              height={225}
              width={"100%"}
            />
          </div>
        </div>
      </div>
    </>
  );
}
