"use client";

import { createStructure } from "../../utils/api/structures";
import React, { useState, useRef, useEffect } from "react";
import DirectionsComponent from "../DirectionsComponent";
import { getAllClients } from "../../utils/api/clients";
import { useParams, useRouter } from "next/navigation";
import { MdLocationPin } from "react-icons/md";
import { useSession } from "next-auth/react";
import ImageCardGrid from "../ImageCardGrid";
import { HiHome } from "react-icons/hi";
import { useAlert } from "../../context/AlertContext";
import mapboxgl from "mapbox-gl"; // or "const mapboxgl = require('mapbox-gl');"
import qs from "qs";
import axios from "axios";
import {
  createInspection,
  updateInspection,
  deleteInspection,
} from "../../utils/api/inspections";
import {
  Button,
  FileInput,
  Label,
  Breadcrumb,
  ToggleSwitch,
  Select,
  Spinner,
} from "flowbite-react";
import { useInspection } from "../../context/InspectionContext";

const InvoiceDrawer = ({ btnText }) => {
  const { showAlert } = useAlert();
  const { data: session, loading } = useSession();
  const router = useRouter();
  const params = useParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [switch1, setSwitch1] = useState(false);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedClientName, setSelectedClientName] = useState("");

  /**
   * Toggles the visibility state of a UI drawer component.
   */

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  useEffect(() => {
    const fetchClients = async () => {
      const apiParams = {
        jwt: session?.accessToken,
        query: "",
      };

      const response = await getAllClients(apiParams);
      console.log(response.data.data);
      setClients(response.data.data);
    };

    fetchClients();
  }, [session]);

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

        <div className="flex flex-col gap-7 p-10">
          <div className="flex flex-col">
            <div className="mb-2 block">
              <Label htmlFor="client" value="Select Client" />
            </div>
            <Select
              id="client"
              required
              defaultValue={selectedClientName || ""}
              onChange={(e) => {
                const getSelectedClient = clients.find(
                  (client) => client.id == e.target.value
                );
                setSelectedClientName(getSelectedClient.attributes.name);
              }}
            >
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.attributes.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col">
            <div className="mb-2 block">
              <Label htmlFor="paid-switch" value="Invoice Number" />
            </div>
            <ToggleSwitch
              id="paid-switch"
              checked={isPaid}
              onChange={setIsPaid}
            />
          </div>
          <div className="flex justify-end">
            <Button className="rounded-md bg-dark-blue-700 text-white">
              Update
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDrawer;
