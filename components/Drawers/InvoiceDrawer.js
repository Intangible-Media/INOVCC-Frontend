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
  const [switch1, setSwitch1] = useState(false);
  const [clients, setClients] = useState([]);

  /**
   * Toggles the visibility state of a UI drawer component.
   */

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <div>
      <Button
        onClick={toggleDrawer}
        className="bg-dark-blue-700 text-white w-full shrink-0 self-start"
      >
        {btnText || "New Inspection"}
      </Button>

      {isDrawerOpen && (
        <div
          className="drawer-background-overlay fixed inset-0 bg-gray-800 bg-opacity-80"
          onClick={toggleDrawer}
        />
      )}

      <div
        className={`im-drawer im-inspection-drawer fixed right-0 bottom-0 z-max overflow-y-auto transition-transform duration-500 rounded-md ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        } bg-white dark:bg-gray-800`}
        tabIndex="-1"
        aria-labelledby="drawer-form-label"
      >
        <button
          onClick={toggleDrawer}
          className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-6 h-6 absolute top-20 right-8 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white z-50"
          aria-label="Close menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="#000000"
            width="800px"
            height="800px"
            viewBox="0 0 256 256"
            id="Flat"
          >
            <path d="M202.82861,197.17188a3.99991,3.99991,0,1,1-5.65722,5.65624L128,133.65723,58.82861,202.82812a3.99991,3.99991,0,0,1-5.65722-5.65624L122.343,128,53.17139,58.82812a3.99991,3.99991,0,0,1,5.65722-5.65624L128,122.34277l69.17139-69.17089a3.99991,3.99991,0,0,1,5.65722,5.65624L133.657,128Z" />
          </svg>
        </button>

        <div className="flex justify-between px-10 py-3 bg-gray-50">
          <Breadcrumb className="dark-text" aria-label="Breadcrumb">
            <Breadcrumb.Item href="/" icon={HiHome}>
              Home
            </Breadcrumb.Item>
            <Breadcrumb.Item href="/">Inspection</Breadcrumb.Item>
            <Breadcrumb.Item href="/">hi </Breadcrumb.Item>
          </Breadcrumb>
        </div>

        <div className="relative overflow-x-clip">
          <div
            className={`absolute inset-0 transition-transform duration-500 transform -translate-x-full hidden`}
          >
            <div id="new-inspection-form" className="flex flex-col gap-7 p-10">
              <div className="flex flex-col gap-2">
                <h3 className="leading-tight text-2xl font-medium">
                  Edit
                  <span>&quot;Map Name Here&quot;</span>
                </h3>
                <p className="text-xs">
                  Please fill out all of the steps below and be sure click
                  “Save” when you’re done.
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-xs" htmlFor="inspectionName">
                  Inspection Name
                </Label>
                <input
                  className="border-b-2 border-x-0 border-t-0 border-b-gray-200 pl-0"
                  type="text"
                  id="inspectionName"
                  placeholder="Enter Inspection Name"
                />
              </div>

              <div className="flex flex-col">
                <div className="mb-2 block">
                  <Label htmlFor="client" value="Select Client" />
                </div>
                <Select id="client" required defaultValue={""}>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.attributes.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDrawer;
