"use client";

import React, { useState, useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl"; // or "const mapboxgl = require('mapbox-gl');"
import {
  Button,
  FileInput,
  Label,
  Dropdown,
  Breadcrumb,
  ToggleSwitch,
} from "flowbite-react";
import DirectionsComponent from "../DirectionsComponent";
import ImageCardGrid from "../ImageCardGrid";
import MapBox from "../MapBox";
import { MdLocationPin } from "react-icons/md";
import { HiHome } from "react-icons/hi";
import Link from "next/link";

const InspectionDrawer = ({ structures = [], btnText }) => {
  const [inspectionName, setInspectionName] = useState("");
  const [documents, setDocuments] = useState([]);
  const [structureDocuments, setStructureDocuments] = useState([]);
  const [structureAssets, setStructureAssets] = useState([]);
  const [switch1, setSwitch1] = useState(false);
  const [formView, setFormView] = useState("inspection");
  const [structureType, setStructureType] = useState("");

  mapboxgl.accessToken =
    "pk.eyJ1IjoiaW50YW5naWJsZS1tZWRpYSIsImEiOiJjbHA5MnBnZGcxMWVrMmpxcGRyaGRteTBqIn0.O69yMbxSUy5vG7frLyYo4Q";

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const getInspectionIconColor = (status) => {
    if (status.toLowerCase() == "uploaded") return "text-green-600";
    if (status.toLowerCase() == "inspected") return "text-green-600";
    if (status.toLowerCase() == "not inspected") return "text-yellow-400";
    else return "text-red-600";
  };

  const getInspectionColor = (status) => {
    if (status.toLowerCase() == "uploaded") return "text-white bg-green-800";
    if (status.toLowerCase() == "inspected")
      return "text-green-800 bg-green-100";
    if (status.toLowerCase() == "not inspected")
      return "text-yellow-800 bg-yellow-100";
    else return "text-red-800 bg-red-100";
  };

  useEffect(() => {
    console.log("structureDocuments updated:", structureDocuments);
  }, [structureDocuments]);

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

  return (
    <>
      <Button
        onClick={toggleDrawer}
        className="bg-dark-blue-700 text-white w-full shrink-0 self-start"
      >
        {btnText ? btnText : "New Inspection"}
      </Button>

      {isDrawerOpen && (
        <div
          className="drawer-background-overlay fixed inset-0 bg-gray-800 bg-opacity-80"
          onClick={toggleDrawer}
        />
      )}

      <div
        className={`im-drawer im-inspection-drawer fixed right-0 bottom-0 z-40 overflow-y-auto transition-transform duration-500 rounded-md ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        } bg-white dark:bg-gray-800`}
        tabIndex="-1"
        aria-labelledby="drawer-form-label"
      >
        <button
          onClick={toggleDrawer}
          className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-6 h-6 absolute top-20 right-8 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white"
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
            <Breadcrumb.Item href="/">
              {inspectionName ? inspectionName : "Map Name Here"}
            </Breadcrumb.Item>
          </Breadcrumb>

          <div className="flex gap-4">
            <button onClick={() => setFormView("inspection")}>
              Inspection
            </button>
          </div>
        </div>

        <div className="relative overflow-x-clip">
          <div
            className={`absolute inset-0 transition-transform duration-500 transform ${
              formView === "inspection" ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div id="new-inspection-form" className="flex flex-col gap-7 p-10">
              <div className="flex flex-col gap-2">
                <h3 className="leading-tight text-2xl font-medium">
                  Edit{" "}
                  {inspectionName === "" ? (
                    <span>&quot;Map Name Here&quot;</span>
                  ) : (
                    <span>&quot;{inspectionName}&quot;</span>
                  )}
                </h3>
                <p className="text-xs">
                  Please fill out all of the steps below and be sure click
                  “Save” when you’re done.
                </p>
              </div>

              <MapBox
                containerId="mapInspectionContainer"
                center={[-112.067413, 33.445564]}
                onStyleLoad={(map) => console.log("Map loaded!", map)}
              />

              <div className="flex flex-col gap-1">
                <Label className="text-xs" htmlFor="inspectionName">
                  Inspection Name
                </Label>
                <input
                  className="border-b-2 border-x-0 border-t-0 border-b-gray-200 pl-0"
                  type="text"
                  id="inspectionName"
                  placeholder="Enter Inspection Name"
                  value={inspectionName}
                  onChange={(e) => setInspectionName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex justify-between">
                  <Label className="text-xs" htmlFor="inspectionName">
                    Map Structures
                  </Label>
                  <button className="flex align-middle text-xs font-medium text-dark-blue-700">
                    Add Structure{" "}
                    <svg
                      className="m-auto ml-2"
                      xmlns="http://www.w3.org/2000/svg"
                      width="10"
                      height="11"
                      viewBox="0 0 10 11"
                      fill="none"
                    >
                      <path
                        d="M4.99967 2.58337V5.50004M4.99967 5.50004V8.41671M4.99967 5.50004H7.91634M4.99967 5.50004H2.08301"
                        stroke="#4B5563"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>

                <div className="flex bg-gray-100 p-4 h-60 mb-1 rounded-lg overflow-hidden">
                  <div className="rounded-md w-full  overflow-auto">
                    {structures.map((structure, index) => (
                      <div
                        key={index}
                        className={`flex flex-row cursor-pointer justify-between items-center bg-white border-0 border-b-2 border-gray-100 w-full hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 p-4 mb-0`}
                        onClick={() => setFormView("structure")}
                      >
                        <div className="flex">
                          <MdLocationPin
                            className={`${getInspectionIconColor(
                              structure.attributes.status
                            )} text-xs font-medium me-2 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300`}
                            style={{ width: 40, height: 40 }}
                          />

                          <div className="flex flex-col justify-between pt-0 pb-0 pl-4 pr-4 leading-normal">
                            <h5 className="flex flex-shrink-0 mb-1 text-sm font-bold tracking-tight text-gray-900 dark:text-white">
                              {structure.attributes.mapSection}
                              <span className="flex items-center font-light ml-1">
                                / {structure.attributes.type}
                              </span>
                            </h5>

                            <DirectionsComponent />
                          </div>
                        </div>

                        <div className="flex">
                          <p className="flex text-sm text-gray-700 dark:text-gray-400">
                            <span
                              className={`${getInspectionColor(
                                structure.attributes.status
                              )} flex align-middle text-xs font-medium me-2 px-2.5 py-0.5 gap-2 rounded-full`}
                            >
                              {structure.attributes.status}
                              {structure.attributes.status === "Uploaded" && (
                                <svg
                                  className="m-auto"
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="10"
                                  height="7"
                                  viewBox="0 0 10 7"
                                  fill="none"
                                >
                                  <path
                                    d="M3.6722 6.99999C3.51987 7.00065 3.37336 6.93626 3.26399 6.82059L0.509147 3.90423C0.454238 3.84574 0.410425 3.77604 0.38021 3.69908C0.349996 3.62212 0.33397 3.53943 0.33305 3.45572C0.331191 3.28665 0.390968 3.12371 0.499233 3.00273C0.607497 2.88175 0.755379 2.81264 0.910347 2.81061C1.06532 2.80858 1.21467 2.8738 1.32557 2.99191L3.67453 5.47756L8.67336 0.181164C8.78441 0.0630521 8.93392 -0.00209614 9.089 5.14605e-05C9.24407 0.00219906 9.39202 0.0714667 9.50028 0.192616C9.60855 0.313765 9.66826 0.476873 9.6663 0.646056C9.66433 0.815239 9.60083 0.976641 9.48979 1.09475L4.08041 6.82059C3.97104 6.93626 3.82452 7.00065 3.6722 6.99999Z"
                                    fill="white"
                                  />
                                </svg>
                              )}
                            </span>
                          </p>
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
                                <span className="ml-2">
                                  <Link href={`/inspections`}>View</Link>
                                </span>{" "}
                              </div>
                            </Dropdown.Item>
                          </Dropdown>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex bg-gray-100 h-60 w-full items-center justify-center rounded-lg overflow-hidden">
                  <Label
                    htmlFor="dropzone-file"
                    className="flex w-full h-full cursor-pointer flex-col items-center justify-center"
                  >
                    <div className="flex flex-col items-center justify-center pb-6 pt-5">
                      <svg
                        className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        SVG, PNG, JPG or GIF (MAX. 800x400px)
                      </p>
                    </div>
                    <FileInput id="dropzone-file" className="hidden" />
                  </Label>
                </div>
              </div>

              {/* <div className="flex flex-col gap-1">
                <Label className="text-xs" htmlFor="inspectionName">
                  Inspection Name
                </Label>
                <select
                  id="countries"
                  value="Canada"
                  className="pl-0 border-x-0 border-t-0 border-b-2 border-b-gray-200"
                  required
                >
                  <option>United States</option>
                  <option>Canada</option>
                  <option>France</option>
                  <option>Germany</option>
                </select>
              </div> */}

              <ImageCardGrid
                files={documents}
                updateFiles={setDocuments}
                labelText={"Inspection Documents"}
                identifier={"inspection-documents"}
              />

              <div className="flex flex-col gap-4">
                <Label className="text-xs" htmlFor="inspectionName">
                  Map Structures
                </Label>
                <div className="flex align-middle justify-between rounded-md border border-gray-200 p-6">
                  <div className="flex gap-4">
                    <svg
                      className="my-auto"
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                    >
                      <path
                        d="M4.28997 18C4.08906 17.9994 3.89068 17.9532 3.70864 17.8645C3.52659 17.7758 3.36524 17.6469 3.23582 17.4866C3.10639 17.3263 3.01199 17.1385 2.95918 16.9363C2.90636 16.7341 2.89641 16.5223 2.93 16.3157L3.70674 11.5922L0.416188 8.24887C0.23191 8.0611 0.101626 7.82333 0.0400503 7.5624C-0.0215258 7.30148 -0.0119419 7.02779 0.0677198 6.77224C0.147381 6.5167 0.293948 6.28947 0.490868 6.11623C0.687788 5.94299 0.927219 5.83063 1.18212 5.79184L5.72823 5.10271L7.76143 0.803608C7.87537 0.562418 8.05176 0.359317 8.27063 0.217294C8.4895 0.0752715 8.74212 0 8.99988 0C9.25765 0 9.51027 0.0752715 9.72914 0.217294C9.94801 0.359317 10.1244 0.562418 10.2383 0.803608L12.2715 5.10083L16.8176 5.78996C17.0726 5.82855 17.312 5.94076 17.509 6.1139C17.706 6.28704 17.8526 6.51421 17.9323 6.76972C18.012 7.02524 18.0215 7.29891 17.9599 7.5598C17.8983 7.82069 17.7679 8.0584 17.5836 8.24605L14.293 11.5922L15.0698 16.3147C15.1133 16.5796 15.085 16.8519 14.9879 17.1009C14.8908 17.3498 14.7289 17.5655 14.5204 17.7235C14.312 17.8814 14.0653 17.9754 13.8083 17.9947C13.5513 18.014 13.2943 17.958 13.0663 17.8329L8.99988 15.6031L4.9335 17.8329C4.7352 17.9423 4.51431 17.9997 4.28997 18ZM2.28197 7.5203L5.12071 10.4083C5.28119 10.5712 5.40121 10.7724 5.47037 10.9945C5.53953 11.2167 5.55575 11.4531 5.51762 11.6833L4.84799 15.7598L8.35816 13.8342C8.55628 13.7264 8.77643 13.6702 8.99988 13.6702C9.22334 13.6702 9.44348 13.7264 9.64161 13.8342L13.1518 15.7589L12.4812 11.6833C12.4434 11.4529 12.46 11.2165 12.5294 10.9943C12.5989 10.7722 12.7192 10.571 12.88 10.4083L15.7178 7.52124L11.7945 6.92693C11.5731 6.89331 11.3629 6.80416 11.1818 6.66712C11.0008 6.53008 10.8543 6.34925 10.755 6.14016L8.99988 2.42786L7.2457 6.1364C7.14654 6.3458 7.00014 6.52696 6.81907 6.66433C6.638 6.8017 6.42768 6.89117 6.20616 6.92506L2.28197 7.5203Z"
                        fill="#312E8E"
                      />
                    </svg>

                    <div className="flex flex-col gap-2">
                      <h6 className="leading-none text-sm font-medium">
                        Add “Map Name 12345.89” To Your Favorites
                      </h6>
                      <p className="leading-none text-xs text-gray-400">
                        This will be automatically saved to your Inspections
                        page.
                      </p>
                    </div>
                  </div>
                  <div className="flex max-w-md flex-col gap-4">
                    <ToggleSwitch checked={switch1} onChange={setSwitch1} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`absolute inset-0 transition-transform duration-500 transform ${
              formView === "structure" ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div id="new-structure-form" className="flex flex-col gap-7 p-10">
              <div className="flex flex-col gap-2">
                <h3 className="leading-tight text-2xl font-medium">
                  Edit{" "}
                  {inspectionName === "" ? (
                    <span>&quot;Structure Name Here&quot;</span>
                  ) : (
                    <span>&quot;{inspectionName}&quot;</span>
                  )}
                </h3>
                <p className="text-xs">
                  Please fill out all of the steps below and be sure click
                  “Save” when you’re done.
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-xs" htmlFor="structureName">
                  Structure Name
                </Label>
                <input
                  className="border-b-2 border-x-0 border-t-0 border-b-gray-200 pl-0"
                  type="text"
                  id="structureName"
                  placeholder="Enter Structure Name"
                  value={inspectionName}
                  onChange={(e) => setInspectionName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-xs" htmlFor="structureType">
                  Structure Type
                </Label>
                <select
                  id="structureType"
                  className="pl-0 border-x-0 border-t-0 border-b-2 border-b-gray-200"
                  value={structureType}
                  onChange={(e) => setStructureType(e.target.value)}
                >
                  <option value="Vault">Vault</option>
                  <option value="Behive">Behive</option>
                  <option value="UG Vault">UG Vault</option>
                  <option value="Pad">Pad</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-xs" htmlFor="longLatCords">
                  Longitude & Latitude
                </Label>
                <input
                  className="border-b-2 border-x-0 border-t-0 border-b-gray-200 pl-0"
                  type="text"
                  id="longLatCords"
                  placeholder="Structure Cordinates"
                  value={inspectionName}
                  onChange={(e) => setInspectionName(e.target.value)}
                />
              </div>

              <MapBox
                containerId="mapStructureContainer"
                center={[2.2945, 48.8584]}
                onStyleLoad={(map) => console.log("Map loaded!", map)}
              />

              <ImageCardGrid
                files={structureDocuments}
                updateFiles={setStructureDocuments}
                labelText={"Structure Documents"}
                identifier={"structure-documents"}
              />

              <ImageCardGrid
                files={structureAssets}
                updateFiles={setStructureAssets}
                labelText={"Structure Assets"}
                identifier={"structure-assets"}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InspectionDrawer;
