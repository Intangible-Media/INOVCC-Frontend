"use client";

import { createStructure } from "../../utils/api/structures";
import React, { useState, useRef, useEffect } from "react";
import DirectionsComponent from "../DirectionsComponent";
import { getAllClients } from "../../utils/api/clients";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MdLocationPin } from "react-icons/md";
import { useSession } from "next-auth/react";
import ImageCardGrid from "../ImageCardGrid";
import { HiHome } from "react-icons/hi";
import { useAlert } from "../../context/AlertContext";
import mapboxgl from "mapbox-gl"; // or "const mapboxgl = require('mapbox-gl');"
import qs from "qs";
import axios from "axios";
import { createClient } from "../../utils/api/clients";
import { ensureDomain } from "../../utils/strings";
import { ElipseIcon } from "../../public/icons/intangible-icons";
import {
  Button,
  FileInput,
  Label,
  Breadcrumb,
  ToggleSwitch,
  Dropdown,
  TextInput,
  Avatar,
  Select,
  Spinner,
} from "flowbite-react";
import { useInspection } from "../../context/InspectionContext";

const InvoiceDrawer = ({ btnText, client = null }) => {
  //console.log(client);
  const { showAlert } = useAlert();
  const { data: session, loading } = useSession();
  const router = useRouter();
  const params = useParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [switch1, setSwitch1] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedClientName, setSelectedClientName] = useState("");

  /**
   * Toggles the visibility state of a UI drawer component.
   */

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleCreateClient = async () => {
    if (!session) return;

    if (!client) {
      showAlert("Please enter a client name", "error");
      return;
    }

    try {
      const apiParams = {
        jwt: session.accessToken,
        payload: {
          data: {
            name: client.name,
          },
        },
        query: "",
      };

      const response = await createClient(apiParams);
      //console.log(response.data);
      showAlert("Client created successfully", "success", 3000, () => {
        router.push(`/clients/${response.data.data.id}`);
      });
    } catch (error) {
      console.error(error);
      showAlert("An error occurred while creating the client", "error");
    }
  };

  const handleUpdateClient = async (updatedClient) => {
    if (!session) return;

    if (!client) {
      showAlert("Please enter a client name", "error");
      return;
    }

    try {
      const apiParams = {
        jwt: session.accessToken,
        payload: {
          data: {
            name: updatedClient.attributes.name,
            phone: updatedClient.attributes.phone,
            email: updatedClient.attributes.email,
            address: updatedClient.attributes.address,
            // contacts: updatedClient.contacts,
          },
        },
        query: "",
      };

      const response = await createClient(apiParams);
      //console.log(response.data);
      showAlert("Client created successfully", "success", 3000);
    } catch (error) {
      console.error(error);
      showAlert("An error occurred while creating the client", "error");
    }
  };

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
            className="client-avatar justify-start uppercase"
            rounded
          >
            {children}
          </Avatar>
        )}
      </>
    );
  };

  const ExistingClient = ({ client }) => {
    const [currentClient, setCurrentClient] = useState(client);

    useEffect(() => {
      //console.log(currentClient);
    }, [currentClient]);

    return (
      <div className="flex flex-col gap-7 p-10">
        <div className="flex flex-col border-b pb-6 mb-3">
          <h2 className="font-medium text-2xl leading-none mb-3">
            Client Settings
          </h2>
          <p className="text-sm text-gray-400 leading-none">
            Please fill out all of the steps below and be sure click “Save” when
            you’re done.
          </p>
        </div>

        <ClientLogo client={currentClient} size="lg">
          <div className="space-y-1 font-medium dark:text-white">
            <h1 className=" text-2xl font-medium">
              {currentClient?.attributes.name || "Company Name"}
            </h1>
            <h5 className="text-xs text-gray-500 font-medium dark:text-gray-400">
              {currentClient?.attributes.name || "Company Name"}
            </h5>
          </div>
        </ClientLogo>

        <div className="flex flex-col">
          <div className="mb-2 block">
            <Label htmlFor="client-name" value="Type Client Name" />
          </div>
          <input
            type="text"
            id="client-name"
            value={currentClient?.attributes.name || ""}
            placeholder="Client Name"
            className="border-b-2 border-x-0 border-t-0 border-b-gray-200 pl-0 placeholder:text-gray-400"
            onChange={(e) =>
              setCurrentClient({
                ...currentClient,
                attributes: {
                  ...currentClient.attributes,
                  name: e.target.value,
                },
              })
            }
          />
        </div>

        <div className="flex flex-col">
          <div className="mb-2 block">
            <Label htmlFor="client-desciption" value="Type Client Name" />
          </div>
          <input
            type="text"
            id="client-desciption"
            value={currentClient?.attributes.name || ""}
            placeholder="Client Name"
            className="border-b-2 border-x-0 border-t-0 border-b-gray-200 pl-0 placeholder:text-gray-400"
            onChange={(e) =>
              setCurrentClient({
                ...currentClient,
                attributes: {
                  ...currentClient.attributes,
                  desciption: e.target.value,
                },
              })
            }
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h3 className="font-medium leading-none text-lg">
              Company Profile Image
            </h3>

            <div className="flex flex-col justify-between lg:flex-row ">
              <p className="text-sm text-gray-400 leading-none">
                Click the image area to upload your own profile image.
              </p>
              <p className="leading-none font-medium text-xs text-dark-blue-700 cursor-pointer">
                Add Image
              </p>
            </div>
          </div>
          <ClientLogo client={currentClient} size="xl"></ClientLogo>
        </div>

        <div className="flex flex-col">
          <div className="mb-2 block">
            <Label htmlFor="client-address" value="Type Client Name" />
          </div>
          <input
            type="text"
            value={currentClient?.attributes.address || ""}
            id="client-address"
            placeholder="Client Address"
            className="border-b-2 border-x-0 border-t-0 border-b-gray-200 pl-0 placeholder:text-gray-400"
            onChange={(e) =>
              setCurrentClient({
                ...currentClient,
                attributes: {
                  ...currentClient.attributes,
                  address: e.target.value,
                },
              })
            }
          />
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col w-full">
            <div className="mb-2 block">
              <Label htmlFor="client-email" value="Type Client Name" />
            </div>
            <input
              type="text"
              value={currentClient?.attributes.email || ""}
              id="client-email"
              placeholder="Client Address"
              className="border-b-2 border-x-0 border-t-0 border-b-gray-200 pl-0 placeholder:text-gray-400"
              onChange={(e) =>
                setCurrentClient({
                  ...currentClient,
                  attributes: {
                    ...currentClient.attributes,
                    email: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="flex flex-col w-full">
            <div className="mb-2 block">
              <Label htmlFor="client-phone" value="Type Client Name" />
            </div>
            <input
              type="text"
              value={currentClient?.attributes.phone || ""}
              id="client-phone"
              placeholder="Client Address"
              className="border-b-2 border-x-0 border-t-0 border-b-gray-200 pl-0 placeholder:text-gray-400"
              onChange={(e) =>
                setCurrentClient({
                  ...currentClient,
                  attributes: {
                    ...currentClient.attributes,
                    phone: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between align-middle">
            <Label htmlFor="client-email" value="Type Client Name" />
            <p className="leading-none font-medium text-xs text-dark-blue-700 cursor-pointer">
              Add Team Member
            </p>
          </div>
          <div className="h-full p-5 bg-gray-100 shadow-inner rounded-lg">
            <div className="rounded-lg overflow-hidden shadow divide-y">
              {currentClient?.attributes.contacts.data?.map(
                (clientContact, index) => (
                  <div
                    key={index}
                    className="flex gap-4 align-middle bg-white p-3"
                  >
                    <img
                      className="border-2 border-white rounded-full dark:border-gray-800 h-12 w-12 object-cover" // Use className for styles except width and height
                      src={`${ensureDomain(
                        clientContact?.attributes?.picture?.data?.attributes
                          ?.formats?.thumbnail?.url
                      )}`}
                      alt="fdsfdsfds"
                    />
                    <div className="flex flex-col gap-1 align-middle justify-center w-32">
                      <p className="leading-none text-sm font-medium">
                        {`${clientContact.attributes.firstName} ${clientContact.attributes.lastName}`}
                      </p>
                      <p className="leading-none text-xs">
                        {clientContact.attributes.jobTitle}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 align-middle justify-center border-l pl-4">
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

                    <div className="flex ml-auto">
                      <Dropdown
                        inline
                        label=""
                        placement="top"
                        dismissOnClick={false}
                        renderTrigger={() => (
                          <div className="flex m-auto">
                            <ElipseIcon />
                          </div>
                        )}
                      >
                        <Dropdown.Item>
                          <div className="flex items-center">
                            <span>
                              <Link href={`/clients/${client.id}`}>View</Link>
                            </span>{" "}
                          </div>
                        </Dropdown.Item>
                      </Dropdown>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <Button onClick={(e) => handleUpdateClient(currentClient)}>
            Update Client
          </Button>
        </div>
      </div>
    );
  };

  const NewClient = () => {
    const [client, setClient] = useState(null);

    return (
      <div className="flex flex-col gap-7 p-10">
        <div className="flex flex-col">
          <div className="mb-2 block">
            <Label htmlFor="client-name" value="Type Client Name" />
          </div>
          <input
            type="text"
            id="client-name"
            placeholder="Client Name"
            className="border-b-2 border-x-0 border-t-0 border-b-gray-200 pl-0 placeholder:text-gray-400"
            onChange={(e) => setClient({ name: e.target.value })}
          />
        </div>

        <div className="flex justify-end">
          <Button
            className="rounded-md bg-dark-blue-700 text-white"
            onClick={(e) => handleCreateClient()}
          >
            Update
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Button
        onClick={toggleDrawer}
        className="bg-dark-blue-700 text-white w-full shrink-0 self-start"
      >
        {btnText || "Open Drawer"}
      </Button>

      {isDrawerOpen && (
        <div
          className="drawer-background-overlay fixed inset-0 bg-gray-800 bg-opacity-80"
          onClick={toggleDrawer}
        />
      )}

      <div
        className={`im-drawer im-inspection-drawer fixed right-0 bottom-0 z-50 overflow-y-auto transition-transform duration-500 rounded-md ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        } bg-white dark:bg-gray-800`}
        tabIndex="-1"
        aria-labelledby="drawer-label"
      >
        <button
          onClick={toggleDrawer}
          className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-3 absolute top-5 right-5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white z-50"
          aria-label="Close menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="flex justify-between px-10 py-3 bg-gray-50">
          <Breadcrumb className="dark-text" aria-label="Breadcrumb">
            <Breadcrumb.Item href="/" icon={HiHome}>
              Home
            </Breadcrumb.Item>
            <Breadcrumb.Item href="/">Invoice</Breadcrumb.Item>
            <Breadcrumb.Item href="/">Create </Breadcrumb.Item>
          </Breadcrumb>
        </div>

        {client ? <ExistingClient client={client} /> : <NewClient />}
      </div>
    </div>
  );
};

export default InvoiceDrawer;
