"use client";

import React from "react";
import {
  Table,
  Breadcrumb,
  TextInput,
  Datepicker,
  Button,
} from "flowbite-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import qs from "qs";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { HiHome } from "react-icons/hi";
import dynamic from "next/dynamic";
import ActivityLog from "../../../components/ActivityLog";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import {
  camelCaseToTitleCase,
  formatDateToString,
} from "../../../utils/strings";
import Link from "next/link";
import InvoiceDrawer from "../../../components/Drawers/InvoiceDrawer";
import InvoiceHeading from "../../../components/Invoice/Heading";

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
              width: 170,
              margin: [0, 0, 0, 15], // Bottom margin
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
              style: "invoiceHeader",
            },
            {
              text: "Invoice Number: #27998324",
              style: "invoiceDetails",
            },
            {
              text: "Invoice Date: 2023-12-05",
              style: "invoiceDetails",
            },
            {
              text: "Due Date: 2024-01-05",
              style: "invoiceDetails",
            },
          ],
          alignment: "right",
        },
      ],
      margin: [0, 0, 0, 20], // Optional: Adjust the top margin
    },
    {
      canvas: [
        {
          type: "line",
          x1: 0,
          y1: 0,
          x2: 515,
          y2: 0, // Width of the line. Adjust as per the page width or requirement.
          lineWidth: 0.5, // Thickness of the line
          lineColor: "#e5e7eb", // Line color
          margin: [0, 10, 0, 10], // Optional: Adjusts the margin around the line (left, top, right, bottom)
        },
      ],
      margin: [0, 0, 0, 10], // Optional: Adjusts the margin around the line (left, top, right, bottom)
    },
    {
      // Address and contact information
      text: [
        "Address: 123 Business Road, City, Country\n",
        "Phone: (123) 456-7890 | Email: contact@example.com",
      ],
      style: "subheader",
      margin: [0, 10, 0, 10], // Top margin
    },
    {
      // Address and contact information
      text: ["Bill To:\n"],
      style: "subheader",
      margin: [0, 10, 0, 8], // Top margin
    },
    {
      text: ["Scottsdale Power\n", "4338 N 20th St Phoenix AZ 815016"],
      style: "subheaderLight",
      margin: [0, 0, 0, 25], // Top margin
    },
  ],

  images: {
    logo: {
      url: "http://localhost:3000/logo-full-horizonal.png",
    },
  },

  styles: {
    header: {
      fontSize: 18,
      bold: true,
      margin: [0, 0, 0, 10],
    },
    invoiceHeader: {
      fontSize: 12,
      bold: true,
      margin: [0, 0, 0, 5],
      color: "#555555",
    },
    subheader: {
      fontSize: 10,
      bold: true,
      margin: [0, 3, 0, 5],
      color: "#4b5563",
    },
    subheaderLight: {
      fontSize: 10,
      margin: [0, 3, 0, 5],
      color: "#4b5563",
    },
    invoiceDetails: {
      fontSize: 10,
      bold: true,
      margin: [0, 0, 0, 2],
      color: "#4b5563",
    },
    tableBody: {
      fontSize: 10,
      margin: [0, 10],
    },

    tableHeader: {
      bold: true,
      fontSize: 10,
      color: "black",
      margin: [0, 5, 0, 5],
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

  // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
  pageMargins: [40, 60, 40, 60],
};

export default function Page({ params }) {
  const { data: session, loading } = useSession();
  const [structures, setStructures] = useState([]);
  const [groupedStructures, setGroupedStructures] = useState({});
  const [clientPricing, setClientPricing] = useState();
  const [viewedPage, setViewedPage] = useState(false);
  const [visibleTables, setVisibleTables] = useState({});
  const [client, setClient] = useState({
    name: "",
    address: "",
  });

  const chartOptions = {
    chart: {
      offsetX: -25, // Pulls the chart closer to the left edge of the container
      offsetY: 0, // Adjust vertically if needed
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    dataLabels: {
      enabled: true,
    },
    plotOptions: {
      bar: {
        barHeight: "100%",
        distributed: true,
        horizontal: true,
        dataLabels: {
          position: "bottom",
        },
      },
    },

    dataLabels: {
      enabled: true,
      textAnchor: "start",
      style: {
        colors: ["#fff"],
      },
      formatter: function (val, opt) {
        return (
          camelCaseToTitleCase(opt.w.globals.labels[opt.dataPointIndex]) +
          ":  " +
          val
        );
      },
      offsetX: 10,
    },
    stroke: {
      width: 1,
      colors: ["#fff"],
    },
    xaxis: {
      categories: Object.keys(groupedStructures).map((type) => {
        return camelCaseToTitleCase(type);
      }),
    },
    yaxis: {
      labels: {
        show: false,
      },
    },

    tooltip: {
      theme: "dark",
      x: {
        show: false,
      },
      y: {
        title: {
          formatter: function () {
            return "";
          },
        },
      },
    },
  };

  const donutChartOptions = {
    chart: {
      type: "donut", // Specify the chart type as 'donut'.
      offsetY: 0, // Adjust vertically if needed
      offsetX: -25, // Pulls the chart closer to the left edge of the container
    },
    labels: Object.keys(groupedStructures).map((type) =>
      camelCaseToTitleCase(type)
    ), // Labels for each slice of the donut
    dataLabels: {
      enabled: false,
      style: {
        colors: ["#fff"],
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "0%", // Adjust the size of the donut hole if needed
          labels: {
            show: false,
            name: {
              show: true,
              fontSize: "22px",
              fontFamily: "Helvetica, Arial, sans-serif",
              fontWeight: 600,
              color: undefined,
              offsetY: -10,
            },
            value: {
              show: true,
              fontSize: "16px",
              fontFamily: "Helvetica, Arial, sans-serif",
              fontWeight: 400,
              color: undefined,
              offsetY: 16,
              formatter: function (val) {
                return val; // Format the value as needed
              },
            },
            total: {
              show: true,
              showAlways: true,
              label: "Total",
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => {
                  return a + b;
                }, 0);
              },
            },
          },
        },
      },
    },
    stroke: {
      width: 1,
      colors: ["#fff"],
    },
    tooltip: {
      theme: "dark",
      // Adjustments to tooltip formatting can go here
    },
  };

  const circularChartOptions = {
    chart: {
      type: "pie", // Specify the chart type as 'pie'. Change to 'donut' for a donut chart.
      offsetY: 0, // Adjust vertically if needed
    },
    labels: Object.keys(groupedStructures).map((type) =>
      camelCaseToTitleCase(type)
    ), // Labels for each slice
    dataLabels: {
      enabled: true,
      style: {
        colors: ["#fff"],
      },
      formatter: function (val, opt) {
        // The formatter is used to format data labels.
        // You might need to adjust based on how you want to display labels and values.
        return opt.w.config.labels[opt.seriesIndex] + ": " + val;
      },
    },
    plotOptions: {
      pie: {
        // Additional customization options for pie charts
        donut: {
          labels: {
            show: true,
            // Further customization for donut labels can go here
          },
        },
      },
    },
    stroke: {
      width: 1,
      colors: ["#fff"],
    },
    tooltip: {
      theme: "dark",
      // Adjustments to tooltip formatting can go here
    },
  };

  const query = qs.stringify({
    populate: {
      client: {
        populate: "*",
      },
      structures: {
        populate: {
          inspection: {
            populate: "*",
          },
        },
      },
    }, // Populate the inspection and its client
    encodeValuesOnly: true,
  });

  const fetchData = async () => {
    if (session?.accessToken) {
      try {
        const invoiceResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/invoices/${params.id}?${query}`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        console.log(
          "Client Pricing",
          invoiceResponse.data.data.attributes.pricing
        );

        setStructures(invoiceResponse.data.data.attributes.structures.data);
        setClient({
          name: invoiceResponse.data.data.attributes.client.data.attributes
            .name,
          address: "4338 N 20th St Phoenix AZ 815016",
        });

        setClientPricing(invoiceResponse.data.data.attributes.pricing || null);
      } catch (error) {
        console.error("Error fetching data", error.response || error);
      }
    }
  };

  const toggleVisibility = (type) => {
    console.log("Toggling visibility for", type);
    setVisibleTables((prevVisibleTables) => ({
      ...prevVisibleTables,
      [type]: !prevVisibleTables[type],
    }));
  };

  useEffect(() => {
    const visibilityState = {};
    Object.keys(groupedStructures).forEach((type) => {
      visibilityState[type] = true; // Initially set all tables to be visible
    });
    setVisibleTables(visibilityState);
  }, [groupedStructures]);

  useEffect(() => {
    // Ensure fetchData is only called once per effect execution.
    fetchData();

    // Define createActivity inside useEffect to capture current values of dependencies.
    const createActivity = async () => {
      if (session?.accessToken && !viewedPage) {
        // Check if viewedPage is false to proceed.t
        try {
          const data = {
            data: {
              collection: "invoices",
              action: "Created",
              user: session?.user.id,
              message: `${session?.user.firstName} ${session?.user.lastName} has viewed this invoice.`,
              collectionId: params.id,
            },
          };
          const url = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/activities`;

          const response = await axios.post(url, data, {
            headers: {
              Authorization: `Bearer ${session?.accessToken}`,
            },
          });

          setViewedPage(true); // This will trigger the effect again, but viewedPage check will prevent re-execution of API call.
        } catch (error) {
          console.error("Error creating activity", error.response || error);
        }
      }
    };

    // Execute createActivity without the duplicate fetchData call and ensure it's client-side.
    if (typeof window !== "undefined") {
      createActivity();
    }
    // Remove viewedPage from the dependencies if setting it true within the effect
    // doesn't necessitate a re-run of the effect's logic or adjust as necessary.
  }, [session, params]); // Consider dependencies carefully.

  useEffect(() => {
    // Function to group structures by type
    const groupByType = (structures) => {
      return structures.reduce((acc, structure) => {
        const type = structure.attributes.type.toLowerCase().replace(" ", "-");
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
            text: camelCaseToTitleCase(type),
            fontSize: 14,
            bold: true,
            margin: [0, 0, 0, 18],
          },
          {
            table: {
              headerRows: 1,
              widths: [40, 120, 75, "*", "*"],
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
                  return [
                    {
                      text: structure.id,
                      style: "tableBody",
                      fillColor: "#ffffff",
                      border: [false, false, false, false],
                    },
                    {
                      text: structure.attributes.mapSection,
                      style: "tableBody",
                      fillColor: "#ffffff",
                      border: [false, false, false, false],
                    },
                    {
                      text: type,
                      style: "tableBody",
                      fillColor: "#ffffff",
                      border: [false, false, false, false],
                    },
                    {
                      text: structure.attributes.status,
                      style: "tableBody",
                      fillColor: "#ffffff",
                      border: [false, false, false, false],
                    },
                    {
                      text: formatDateToString(
                        structure.attributes.inspectionDate,
                        false
                      ),
                      style: "tableBody",
                      fillColor: "#ffffff",
                      border: [false, false, false, false],
                    },
                  ];
                }),
              ],
            },
            layout: {
              paddingTop: function (i, node) {
                return 5;
              },
              paddingBottom: function (i, node) {
                return 5;
              },
              hLineWidth: function (i, node) {
                return i === 0 || i === node.table.body.length ? 5 : 5;
              },
              hLineColor: function (i, node) {
                return i === 0 || i === node.table.body.length
                  ? "black"
                  : "gray";
              },
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

      const createInvoiceTable = (items) => {
        return [
          {
            table: {
              headerRows: 1,
              widths: [40, "*", 75, 75, 75], // Adjusted widths for invoice columns
              body: [
                // Header row
                [
                  {
                    text: "No.",
                    style: "tableHeader",
                    fillColor: "#f9fafb",
                    border: [false, false, false, false],
                  },
                  {
                    text: "Item Description",
                    style: "tableHeader",
                    fillColor: "#f9fafb",
                    border: [false, false, false, false],
                  },
                  {
                    text: "Quantity",
                    style: "tableHeader",
                    fillColor: "#f9fafb",
                    border: [false, false, false, false],
                  },
                  {
                    text: "Unit Price",
                    style: "tableHeader",
                    fillColor: "#f9fafb",
                    border: [false, false, false, false],
                  },
                  {
                    text: "Total",
                    style: "tableHeader",
                    fillColor: "#f9fafb",
                    border: [false, false, false, false],
                  },
                ],
                // Dummy data rows
                ...items.map((item, index) => {
                  return [
                    {
                      text: index + 1,
                      style: "tableBody",
                      fillColor: "#ffffff",
                      border: [false, false, false, false],
                    },
                    {
                      text: item.description,
                      style: "tableBody",
                      fillColor: "#ffffff",
                      border: [false, false, false, false],
                    },
                    {
                      text: item.quantity,
                      style: "tableBody",
                      fillColor: "#ffffff",
                      border: [false, false, false, false],
                    },
                    {
                      text: `$${item.unitPrice.toFixed(2)}`,
                      style: "tableBody",
                      fillColor: "#ffffff",
                      border: [false, false, false, false],
                    },
                    {
                      text: `$${(item.quantity * item.unitPrice).toFixed(2)}`,
                      style: "tableBody",
                      fillColor: "#ffffff",
                      border: [false, false, false, false],
                    },
                  ];
                }),
              ],
            },
            layout: {
              paddingTop: function (i, node) {
                return 5;
              },
              paddingBottom: function (i, node) {
                return 5;
              },
              hLineWidth: function (i, node) {
                return i === 0 || i === node.table.body.length ? 1 : 1;
              },
              hLineColor: function (i, node) {
                return i === 0 || i === node.table.body.length
                  ? "black"
                  : "gray";
              },
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

      // Example usage with dummy data for the invoice items
      const invoiceItems = [
        {
          description: "Web Development Services",
          quantity: 120,
          unitPrice: 150.0,
        },
        { description: "Web Hosting (Annual)", quantity: 1, unitPrice: 300.0 },
        // You can add more items as needed
      ];

      docDefinition.content.push(createInvoiceTable(invoiceItems));

      // Create a table for each type in the PDF document definition
      docDefinition.content.push(
        Object.keys(newGroupedStructures).map((type) =>
          createTableForType(newGroupedStructures[type], type)
        )
      );
    }
  }, [structures]);

  const generatePdf = () => {
    pdfMake.createPdf(docDefinition).open();
  };

  const sortedStructures = [...structures].sort((a, b) =>
    a.attributes.type.localeCompare(b.attributes.type)
  );

  const subTotalAmount = Object.keys(groupedStructures).reduce(
    (total, type) => {
      // Ensure clientPricing[type] is a number to avoid NaN results.
      const pricePerType = Number(clientPricing[type]) || 0;
      const quantityPerType = groupedStructures[type].length;
      const lineTotal = pricePerType * quantityPerType;

      return total + lineTotal;
    },
    0
  );

  const discount = 100;

  const totalAmount = subTotalAmount - Number(discount);

  return (
    <>
      <div className="grid grid-cols-6 gap-4 my-6">
        <div className="flex flex-col col-span-4 border-gray-300 dark:border-gray-600 bg-white gap-4">
          <div className="invoice-viewer overflow-x-auto shadow-md">
            <InvoiceHeading />

            <section className="mb-10">
              <p className="text-lg text-gray-700 font-semibold">Bill To:</p>
              <p className="text-sm text-gray-600">{client.name}</p>
              <p className="text-sm text-gray-600">{client.address}</p>
            </section>

            <section className="mb-0 border border-gray-200 rounded-t rounded-b-none rounded-bl-md overflow-hidden">
              <Table hoverable className="border rounded-md">
                <Table.Head>
                  <Table.HeadCell className="text-left pt-4 pb-5 px-5 remove-border-radius">
                    Type of Structure
                  </Table.HeadCell>
                  <Table.HeadCell className="text-right pt-4 pb-5 px-5 remove-border-radius">
                    Quantity
                  </Table.HeadCell>
                  <Table.HeadCell className="text-right pt-4 pb-5 px-5 remove-border-radius">
                    Unit Price
                  </Table.HeadCell>
                  <Table.HeadCell className="text-right pt-4 pb-5 px-5 remove-border-radius">
                    Total
                  </Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y ">
                  {/* Repeat for each item */}
                  {Object.keys(groupedStructures).map((type, key) => {
                    return (
                      <Table.Row key={`${key}-${type}`}>
                        <Table.Cell className="pt-4 pb-5 px-5 text-xs text-gray-800">
                          {camelCaseToTitleCase(type)}
                        </Table.Cell>
                        <Table.Cell className="text-right pt-4 pb-5 px-5 text-xs text-gray-800">
                          {groupedStructures[type].length}
                        </Table.Cell>
                        <Table.Cell className="text-right pt-4 pb-5 px-5 text-xs text-gray-800">
                          ${clientPricing ? clientPricing[type] : ""}
                        </Table.Cell>
                        <Table.Cell className="text-right pt-4 pb-5 px-5 text-xs text-gray-800">
                          $
                          {`${
                            (
                              clientPricing[type] *
                              groupedStructures[type].length
                            ).toFixed(2) || ""
                          }`}
                          {/* {clientPricing[type.toLowerCase().replace(" ", "-")] &&
              clientPricing[type.toLowerCase().replace(" ", "-")].price * groupedStructures[type].length} */}
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table>
            </section>
            <section className="ml-auto border-2 border-t-0 border-gray-200 rounded-b rounded-t-none bg-gray-50 w-fit overflow-hidden mb-14">
              <Table className="text-right">
                <Table.Body className=" divide-y divide-gray-200">
                  <Table.Row>
                    <Table.Cell className="pt-4 pb-5 px-12 font-semibold text-gray-900">
                      Subtotal:{" "}
                    </Table.Cell>
                    <Table.Cell className="pt-4 pb-5 px-5 font-semibold text-gray-900">
                      {`$${subTotalAmount.toFixed(2)}`}
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell className="pt-4 pb-5 px-12 font-semibold text-gray-900">
                      Total:
                    </Table.Cell>
                    <Table.Cell className="pt-4 pb-5 px-5 font-semibold text-gray-900">
                      {`$${totalAmount.toFixed(2)}`}
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
            </section>

            <div className="flex flex-col gap-3">
              {Object.keys(groupedStructures).map((type, index) => (
                <div
                  key={index}
                  className="p-5 border rounded-md border-gray-300"
                >
                  <div className="flex items-center justify-between">
                    <p className="flex items-center gap-2 text-lg font-semibold mr-auto">
                      {camelCaseToTitleCase(type)}
                    </p>
                    <div
                      className="flex cursor-pointer"
                      onClick={() => toggleVisibility(type)}
                    >
                      {visibleTables[type] ? (
                        <IoIosArrowUp size={"14px"} />
                      ) : (
                        <IoIosArrowDown size={"14px"} />
                      )}
                    </div>
                  </div>

                  {visibleTables[type] && (
                    <div className="group-type-table border border-gray-200 rounded-md overflow-hidden mt-4">
                      <Table striped hoverable key={type}>
                        <Table.Head>
                          <Table.HeadCell className="pt-4 pb-5 px-5 text-xs text-gray-900">
                            ID
                          </Table.HeadCell>
                          <Table.HeadCell className="pt-4 pb-5 px-5 text-xs text-gray-900">
                            Map Section
                          </Table.HeadCell>
                          <Table.HeadCell className="pt-4 pb-5 px-5 text-xs text-gray-900">
                            Type
                          </Table.HeadCell>
                          <Table.HeadCell className="pt-4 pb-5 px-5 text-xs text-gray-900">
                            Inspection Date
                          </Table.HeadCell>
                        </Table.Head>
                        <Table.Body className="divide-y">
                          {groupedStructures[type].map((structure) => {
                            return (
                              <Table.Row
                                className="bg-white dark:border-gray-700 dark:bg-gray-800"
                                key={structure.id}
                              >
                                <Table.Cell className="whitespace-nowrap font-medium dark:text-white pt-4 pb-5 px-5 text-xs text-gray-900">
                                  {structure.id}
                                </Table.Cell>
                                <Table.Cell className="pt-4 pb-5 px-5 text-xs text-gray-900">
                                  <Link
                                    className="text-dark-blue-600 hover:underline"
                                    href={`/inspections/${structure.attributes.inspection.data.id}?structure=${structure.id}`}
                                  >
                                    {structure.attributes.mapSection}
                                  </Link>
                                </Table.Cell>
                                <Table.Cell className="pt-4 pb-5 px-5 text-xs text-gray-900">
                                  {structure.attributes.type}
                                </Table.Cell>
                                <Table.Cell className="pt-4 pb-5 px-5 text-xs text-gray-900">
                                  {formatDateToString(
                                    structure.attributes.inspectionDate
                                  )}
                                </Table.Cell>
                              </Table.Row>
                            );
                          })}
                        </Table.Body>
                      </Table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 col-span-2 h-fit-content px-6 py-8 bg-white rounded-lg sticky shadow">
          <div className="flex flex-col gap-3">
            <h2 className="leading-tight text-2xl font-medium">New Invoice</h2>
            <p className="text-xs text-gray-400 mb-8">
              Please fill out all of the steps below and be sure click “Load
              Data” before you click “Publish”
            </p>
          </div>
          <div className="flex flex-col">
            <ApexChart
              type="donut"
              options={donutChartOptions}
              series={Object.keys(groupedStructures).map((type) => {
                return type.length;
              })}
              height={300}
              width={"100%"}
            />
          </div>
          <div className="grid grid-flow-col gap-3">
            <Button
              onClick={generatePdf}
              className="bg-dark-blue-700 text-white w-full shrink-0 self-start"
            >
              Download
            </Button>
            <InvoiceDrawer btnText="Invoice" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1">
        <ActivityLog id={params.id} collection={"invoices"} />
      </div>
    </>
  );
}
