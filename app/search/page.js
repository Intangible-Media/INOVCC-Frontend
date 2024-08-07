"use client";

import { useState, useEffect } from "react";
import qs from "qs";
import { getAllStructure } from "../../utils/api/structures";
import { getAllInspections } from "../../utils/api/inspections";
import { getAllInvoices } from "../../utils/api/invoices";
import { getAllClients } from "../../utils/api/clients";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Avatar, Progress, Badge, Button } from "flowbite-react";
import Link from "next/link";
import { ensureDomain, downloadFileFromUrl } from "../../utils/strings";
import { DownloadOutlineIcon } from "../../public/icons/intangible-icons";
import DirectionsComponent from "../../components/DirectionsComponent";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();

  const search = searchParams.get("search");
  console.log("====================================================");
  console.log("====================================================");
  console.log("====================================================");
  console.log("====================================================");
  console.log("====================================================");
  console.log("====================================================");
  console.log("Search Params", search);
  const { data: session } = useSession();
  const [structures, setStructures] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [images, setImages] = useState([]);

  const resultsNumber =
    structures.length +
    inspections.length +
    clients.length +
    invoices.length +
    images.length;

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

  useEffect(() => {
    if (!session) return;

    const fetchInspections = async () => {
      const inspectionQuery = qs.stringify({
        filters: {
          name: {
            $contains: search,
          },
        },
        populate: {
          structures: {
            fields: ["status"],
          },
        },
      });

      const apiParams = {
        jwt: session.accessToken,
        query: inspectionQuery,
      };

      try {
        const response = await getAllInspections(apiParams);
        console.log("Inspections", response);

        setInspections(response.data.data);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchStructures = async () => {
      const structuresQuery = qs.stringify({
        filters: {
          mapSection: {
            $contains: search,
          },
        },
        populate: {
          inspection: {
            fields: ["name"],
          },
        },
      });

      const apiParams = {
        jwt: session.accessToken,
        query: structuresQuery,
      };

      try {
        const response = await getAllStructure(apiParams);
        console.log("structures", response);
        setStructures(response);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchClients = async () => {
      const clientsQuery = qs.stringify({
        filters: {
          name: {
            $contains: search,
          },
        },
        populate: "logo",
      });

      const apiParams = {
        jwt: session.accessToken,
        query: clientsQuery,
      };

      try {
        const response = await getAllClients(apiParams);
        console.log("clients", response);
        setClients(response.data.data);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchInvoices = async () => {
      const invoiceQuery = qs.stringify({
        filters: {
          name: {
            $contains: search,
          },
        },
      });

      const apiParams = {
        jwt: session.accessToken,
        query: invoiceQuery,
      };

      try {
        const response = await getAllInvoices(apiParams);
        console.log("Invoices", response);
        setInvoices(response.data.data);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchImages = async () => {
      const imagesQuery = qs.stringify({
        filters: {
          name: {
            $contains: search,
          },
          $or: [
            {
              mime: {
                $eq: "image/jpeg",
              },
            },
            {
              mime: {
                $eq: "image/png",
              },
            },
          ],
        },
      });

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/upload/files?${imagesQuery}`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        setImages(response.data);
        console.log("images", response);
      } catch (error) {
        console.error(error);
      }
    };

    fetchInspections();
    fetchStructures();
    fetchClients();
    fetchInvoices();
    fetchImages();
  }, [session, search]);

  const ClientLogo = ({ client }) => {
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
          <img
            src={ensureDomain(client.attributes.logo.data.attributes.url)}
            alt=""
            className="rounded-full w-10 h-10"
          />
        ) : (
          <Avatar placeholderInitials={abbreviatedName} rounded />
        )}
      </>
    );
  };

  return (
    <div className="my-6">
      <h1 className="leading-tight text-2xl font-medium">
        {resultsNumber} Results for &ldquo;{search}&ldquo;
      </h1>

      <div className="flex flex-col gap-6 my-4">
        {invoices.length > 0 && (
          <div className="flex flex-col">
            <h2 className="flex gap-2 text-xl font-bold dark:text-white mb-3">
              Invoices
              <Badge className="bg-gray-300 text-gray-700 self-center rounded-lg">
                {invoices.length}
              </Badge>
            </h2>
            <div className="overflow-x-auto whitespace-nowrap">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="inline-block w-60  border bg-white p-4 border-gray-300 rounded-md mr-4"
                >
                  <h3 className="text-dark-blue-700 font-semibold cursor-pointer text-sm mb-2 shorten-text">
                    {invoice.attributes.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-1">
                    <span className="font-semibold">Total:</span> $
                    {invoice.attributes.total.toFixed(2)}
                  </p>
                  <p className="text-gray-600 text-sm mb-1">
                    <span className="font-semibold">Paid On:</span>{" "}
                    {new Date().toLocaleDateString()}
                  </p>
                  <p className="text-gray-600 text-sm">
                    <span className="font-semibold">Client:</span> Scottsdale
                    Power
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {inspections.length > 0 && (
          <div className="flex flex-col">
            <h2 className="flex gap-2 text-xl font-bold dark:text-white mb-3">
              Inspections{" "}
              <Badge className="bg-gray-300 text-gray-700 self-center rounded-lg">
                {inspections.length}
              </Badge>
            </h2>
            <div className="overflow-x-auto whitespace-nowrap">
              {inspections.map((inspection) => (
                <div
                  key={inspection.id}
                  className="inline-block w-60 border bg-white p-4 border-gray-300 rounded-md mr-4"
                >
                  <Link href={`/inspections/${inspection.id}`}>
                    <h3 className=" text-dark-blue-700 font-semibold cursor-pointer text-sm">
                      {inspection.attributes.name}
                    </h3>
                  </Link>
                  <Progress
                    progress={getInspectionProgress(inspection)}
                    className="mt-3"
                    textLabel=""
                    size="lg"
                    color="green"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {structures.length > 0 && (
          <div className="flex flex-col">
            <h2 className="flex gap-2 align-middle text-xl font-bold dark:text-white mb-3">
              Structures
              <Badge className="bg-gray-300 text-gray-700 self-center rounded-lg">
                {structures.length}
              </Badge>
            </h2>

            <div className="overflow-x-auto whitespace-nowrap">
              {structures.map((structure) => (
                <div
                  key={structure.id}
                  className="inline-block w-60 border bg-white p-4 border-gray-300 rounded-md mr-4"
                >
                  <Link
                    href={`/inspections/${structure.attributes.inspection.data.id}?structure=${structure.id}`}
                  >
                    <h3 className=" text-dark-blue-700 font-semibold cursor-pointer text-sm">
                      {structure.attributes.mapSection}
                    </h3>
                  </Link>
                  <DirectionsComponent
                    destinationLongitude={structure.attributes.longitude}
                    destinationLatitude={structure.attributes.latitude}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {clients.length > 0 && (
          <div className="flex flex-col">
            <h2 className="flex gap-2 text-xl font-bold dark:text-white mb-3">
              Clients
              <Badge className="bg-gray-300 text-gray-700 self-center rounded-lg">
                {clients.length}
              </Badge>
            </h2>
            <div className="flex overflow-x-auto whitespace-nowrap">
              {clients.map((client) => (
                <div
                  key={client.id} // Added key attribute
                  className="flex shrink-0 grow-0 w-60 bg-white p-4 border border-gray-300 rounded-md mr-4 gap-4"
                >
                  <ClientLogo client={client} />
                  <div className="flex flex-col gap-1 justify-center shorten-text">
                    <Link href={`/clients/${client.id}`}>
                      <p className=" text-dark-blue-700 cursor-pointer leading-none text-sm font-medium shorten-text">
                        {client.attributes.name}
                      </p>
                    </Link>
                    <p className="leading-none text-xs text-gray-500">
                      2 Contacts
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {images.length > 0 && (
          <div className="flex flex-col">
            <h2 className="flex gap-2 text-xl font-bold dark:text-white mb-3">
              Images{" "}
              <Badge className="bg-gray-300 text-gray-700 self-center rounded-lg">
                {images.length}
              </Badge>
            </h2>
            <div className="overflow-x-auto whitespace-nowrap">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="relative inline-block w-60 aspect-square border border-gray-300 rounded-md mr-4 overflow-hidden"
                >
                  <div
                    style={{
                      backgroundImage: `url(${ensureDomain(image.url)})`,
                    }}
                    className="w-full h-full bg-cover bg-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70 hover:opacity-100 transition duration-75"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex gap-2 justify-between">
                      <p className="text-white shorten-text">{image.name}</p>
                      <button
                        className="p-0 ml-3"
                        onClick={() =>
                          downloadFileFromUrl(
                            ensureDomain(image.url),
                            image.name
                          )
                        }
                      >
                        <DownloadOutlineIcon />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
