"use client";

import { useState, useEffect } from "react";
import { Avatar, Button } from "flowbite-react";
import { getClient } from "../../../utils/api/clients";
import { getAllStructure } from "../../../utils/api/structures";
import { useSession } from "next-auth/react";
import { ensureDomain } from "../../../utils/strings";
import FooterDateExport from "../../../components/Cards/FooterDateExport";
import InvoiceTable from "../../../components/InvoiceTable";
import dynamic from "next/dynamic";
import qs from "qs";
import ImageCardGrid from "../../../components/ImageCardGrid";
import ActivityLog from "../../../components/ActivityLog";
import ClientDrawer from "../../../components/Drawers/ClientDrawer";
import { useClient } from "../../../context/ClientContext";
import StructureTypesNumbers from "../../../components/StructureTypesNumbers";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function Page({ params }) {
  const { data: session } = useSession();
  const { client: clientData, setClient: setClientData } = useClient();
  const [client, setClient] = useState(null);
  const [structures, setStructures] = useState([]);

  console.log(clientData);

  const optionAlt = {
    chart: {
      id: "apexchart-example-alt",
      toolbar: {
        show: false, // Hides the toolbar
      },
      sparkline: {
        enabled: true, // This will make the chart occupy the full space of its container
      },
      zoom: {
        autoScaleYaxis: true, // Ensures the chart uses the full width
      },
    },
    grid: {
      show: false, // Removes the grid background
    },
    colors: ["#62C3F7"], // Sets the color of the bars

    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 100],
        colorStops: [
          {
            offset: 0,
            color: "#62C3F7",
            opacity: 0.6,
          },
          {
            offset: 100,
            color: "#62C3F7",
            opacity: 0.0,
          },
        ],
      },
    },
    xaxis: {
      categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999],
      labels: {
        show: true, // Hides the x-axis labels
      },
      axisBorder: {
        show: false, // Hides the x-axis border
      },
      axisTicks: {
        show: false, // Hides the x-axis ticks
      },
    },
    yaxis: {
      show: false, // Hides the y-axis
    },
    // Add any other options you need here
  };

  const seriesAlt = [
    {
      name: "Year",
      data: [50, 80, 75, 10, 69, 30, 149, 91, 66, 34, 87, 100],
    },
  ];

  useEffect(() => {
    if (!session) return;

    const fetchClient = async () => {
      try {
        const query = qs.stringify({
          populate: {
            contacts: {
              populate: {
                picture: "*", // Populate the 'picture' relation
              },
              fields: [
                // Specify fields you want from 'contacts'
                "firstName",
                "lastName",
                "email",
                "phone",
                "jobTitle",
                "picture", // Include 'picture' in the fields if you want its ID
              ],
            },
            contracts: {
              populate: "*",
            },
            logo: {
              fields: ["url"],
            },
            invoices: {
              populate: "*",
            },
          },
        });

        const apiParams = {
          id: params.id,
          jwt: session?.accessToken,
          query: query,
        };

        const response = await getClient(apiParams);

        //console.log(response.data.data);

        setClient(response.data.data);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchStructures = async () => {
      try {
        const query = qs.stringify(
          {
            populate: {
              inspection: {
                populate: {
                  client: {
                    filters: {
                      id: {
                        // Adjust 'date' to the appropriate attribute you want to filter on
                        $eq: params.id,
                      },
                    },
                  },
                },
              },
            },
          },
          {
            encodeValuesOnly: true, // This option ensures that only the values are encoded
          }
        );

        const apiParams = {
          jwt: session?.accessToken,
          query: query,
        };

        const response = await getAllStructure(apiParams);

        //console.log(response.data.data);

        setStructures(response.data.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchClient();
    fetchStructures();
  }, [session]);

  const ClientLogo = ({ client, children, size = "lg" }) => {
    if (!client) return null;
    const abbreviatedName = client.attributes.name
      .split(" ")
      .filter(
        (n) =>
          !["and", "but", "for", "nor", "or", "so", "yet", "&"].includes(
            n.toLowerCase()
          )
      ) // Filter out coordinating conjunctions and "&"
      .map((n) => n[0].toUpperCase()) // Get the first letter of each word
      .join("")
      .slice(0, 2); // Only keep the first two characters
    return (
      <>
        {client.attributes.logo.data ? (
          <Avatar
            img={ensureDomain(client.attributes.logo.data.attributes.url)}
            placeholderInitials={abbreviatedName}
            size={size}
            className="client-avatar justify-start"
            rounded
          >
            {children}
          </Avatar>
        ) : (
          <Avatar
            placeholderInitials={abbreviatedName}
            size={size}
            className="client-avatar justify-start"
            rounded
          >
            {children}
          </Avatar>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col justify-between py-6">
      <section className="grid grid-cols-2 w-full mb-5">
        <div className="flex">
          <ClientLogo client={client}>
            <div className="space-y-1 font-medium dark:text-white">
              <h1 className=" text-2xl font-medium">
                {client?.attributes.name || "Company Name"}
              </h1>
              <h5 className="text-xs text-gray-500 font-medium dark:text-gray-400">
                {client?.attributes.name || "Company Name"}
              </h5>
            </div>
          </ClientLogo>
        </div>
        <div className="">
          <ClientDrawer btnText={"Edit Client"} client={client} />
        </div>
      </section>

      <section className="grid grid-cols-3 w-full mt-4 gap-4">
        <div className="flex col-span-4 md:col-span-1 flex-col border-gray-300 bg-white gap-4 p-4 md:p-8 rounded-lg">
          <div className="border-b pb-5">
            <h6 className="text-lg font-semibold">Company Info</h6>
          </div>
          <ClientLogo client={client} size="md" className="justify-start">
            <div className="space-y-1 font-medium dark:text-white">
              <h4 className=" text-sm font-medium leading-none text-gray-900">
                {client?.attributes.name || "Company Name"}
              </h4>
            </div>
          </ClientLogo>
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-sm text-left text-gray-500">
              <tbody>
                <tr>
                  <td className="font-medium text-gray-900 align-top pb-3 pr-2">
                    Phone:
                  </td>
                  <td className="align-top pb-3">
                    {client?.attributes?.phone || ""}
                  </td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-900 align-top pb-3 pr-2">
                    Email:
                  </td>
                  <td className="align-top pb-3">
                    {client?.attributes?.email || ""}
                  </td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-900 align-top pb-3 pr-2">
                    Address:
                  </td>
                  <td className="align-top pb-3">
                    {client?.attributes?.address || ""}
                  </td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-900 align-top pb-3 pr-2">
                    Website:
                  </td>
                  <td className="align-top pb-3">
                    <a
                      href={client?.attributes?.website || ""}
                      className="text-dark-blue-600 hover:underline"
                    >
                      {client?.attributes?.website || ""}
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <FooterDateExport className="mt-auto" />
        </div>
        <div className="flex col-span-4 md:col-span-1 flex-col border-gray-300 bg-white gap-0 p-4 md:p-8 rounded-lg">
          <div className="flex justify-between h-11">
            <h3 className="text-3xl font-bold dark:text-white">$495,999</h3>
            <div>
              <span className="text-base font-semibold text-green-500">
                12%
              </span>
            </div>
          </div>
          <p className="text-gray-500">Products Inspected</p>
          <div className="w-full mt-auto">
            <ApexChart
              type="area"
              options={optionAlt}
              series={seriesAlt}
              height={250}
              width={"100%"}
            />
          </div>
          <FooterDateExport className="mt-auto" />
        </div>

        <div className="flex col-span-4 md:col-span-1 flex-col border-gray-300 bg-white gap-4 p-4 md:p-8 rounded-lg">
          <h6 className="text-lg font-semibold">{client?.attributes.name}</h6>

          <div className="h-full">
            {client?.attributes.contacts.data?.map((clientContact, index) => (
              <div
                key={index}
                className="alternate-bg flex gap-4 align-middle py-2"
              >
                <img
                  className="border-2 border-white rounded-full dark:border-gray-800 h-12 w-12 object-cover" // Use className for styles except width and height
                  src={`${ensureDomain(
                    clientContact?.attributes?.picture?.data?.attributes
                      ?.formats?.thumbnail?.url
                  )}`}
                  alt="fdsfdsfds"
                />
                <div className="flex flex-col gap-1 align-middle justify-center">
                  <p className="leading-none text-sm font-medium">
                    {`${clientContact.attributes.firstName} ${clientContact.attributes.lastName}`}
                  </p>
                  <p className="leading-none text-xs mb-3">
                    {clientContact.attributes.jobTitle}
                  </p>
                  <p className="leading-none text-xs">
                    <a href={`mailto:${clientContact.attributes.email}`}>
                      E: {clientContact.attributes.email}
                    </a>
                  </p>
                  <p className="leading-none text-xs">
                    <a href={`tel:${clientContact.attributes.phone}`}>
                      P: +{clientContact.attributes.phone}
                    </a>
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-5 border-t mt-auto">
            {/* <button className="text-sm text-gray-500 font-medium">Edit</button> */}
            <button className="flex align-middle text-sm font-semibold">
              Email Client
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 w-full mt-4 gap-4">
        <div className="flex col-span-1 md:col-span-1 flex-col border-gray-300 bg-white gap-4 p-4 md:p-8 rounded-lg">
          {client && (
            <InvoiceTable invoiceData={client.attributes.invoices.data} />
          )}
        </div>
        <div className="flex col-span-1 md:col-span-1 flex-col border-gray-300 bg-white gap-4 p-4 md:p-8 rounded-lg">
          <h6 className="text-lg font-semibold">Contracts</h6>
          {client && (
            <ImageCardGrid
              files={client?.attributes.contracts.data || []}
              identifier={"contracts"}
              columns={3}
              background="bg-white"
              padded={false}
              editMode={false}
            />
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 w-full mt-4 gap-4">
        <StructureTypesNumbers structures={structures} />
      </section>

      <section className="grid grid-cols-1 w-full mt-4 gap-4">
        {client && <ActivityLog collection={"clients"} id={client.id} />}
      </section>
    </div>
  );
}
