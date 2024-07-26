"use client";

import { createStructure, updateStructure } from "../../utils/api/structures";
import React, { useState, useRef, useEffect } from "react";
import DirectionsComponent from "../DirectionsComponent";
import { getAllClients } from "../../utils/api/clients";
import { getAllTeams } from "../../utils/api/teams";
import { useParams, useRouter } from "next/navigation";
import { MdLocationPin, MdArrowBackIos } from "react-icons/md";
import { useSession } from "next-auth/react";
import ImageCardGrid from "../ImageCardGrid";
import { HiHome } from "react-icons/hi";
import Papa from "papaparse";
import { useAlert } from "../../context/AlertContext";
import mapboxgl from "mapbox-gl"; // or "const mapboxgl = require('mapbox-gl');"
import qs from "qs";
import { GoGear } from "react-icons/go";
import { useLoading } from "../../context/LoadingContext";
import {
  FaRegCalendarCheck,
  FaRegBuilding,
  FaListCheck,
} from "react-icons/fa6";
import axios from "axios";
import {
  createInspection,
  updateInspection,
  deleteInspection,
  uploadFiles as uploadInspectionFiles,
} from "../../utils/api/inspections";
import {
  Button,
  Badge,
  FileInput,
  Label,
  Breadcrumb,
  ToggleSwitch,
  Datepicker,
  Checkbox,
  Select,
  Spinner,
} from "flowbite-react";
import {
  useInspection,
  fetchInspection,
} from "../../context/InspectionContext";
import {
  structureStatuses,
  structureTypes,
} from "../../utils/collectionListAttributes";

const InspectionDrawer = ({ btnText, showIcon = false }) => {
  const { showAlert } = useAlert();
  const { inspection, setInspection, refreshInspection } = useInspection();
  const { data: session, loading } = useSession();
  const router = useRouter();
  const params = useParams();
  const { showLoading, showSuccess, showError, resetLoading } = useLoading();

  const [loadingNewStructure, setLoadingNewStructure] = useState(false);
  const [isLoadingInspection, setIsLoadingInspection] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formView, setFormView] = useState("inspection");
  const [selectedStructures, setSelectedStructures] = useState([]);
  const [switch1, setSwitch1] = useState(false);
  const [clients, setClients] = useState([]);
  const [teams, setTeams] = useState([]);
  const [bulkUpdateView, setBulkUpdateView] = useState("");
  const [bulkStructuresType, setBulkStructuresType] = useState("");
  const [bulkStructuresStatus, setBulkStructuresStatus] = useState("");
  const [bulkStructuresTeam, setBulkStructuresTeam] = useState("Select a Team");
  const [bulkStructuresStartSchedule, setBulkStructuresStartSchedule] =
    useState(Date.now());
  const [bulkStructuresEndSchedule, setBulkStructuresEndSchedule] = useState(
    Date.now()
  );
  const [structure, setStructure] = useState({
    inspection: null,
    mapSection: null,
    status: null,
    type: null,
    longitude: null,
    latitude: null,
    documents: [],
    images: [],
  });

  const [newInspection, setNewInspection] = useState({
    name: "",
    structures: [],
    client: null,
  });

  mapboxgl.accessToken =
    "pk.eyJ1IjoiaW50YW5naWJsZS1tZWRpYSIsImEiOiJjbHA5MnBnZGcxMWVrMmpxcGRyaGRteTBqIn0.O69yMbxSUy5vG7frLyYo4Q";

  useEffect(() => {
    if (inspection) {
      setNewInspection({
        name: inspection.name || "",
        structures: inspection.structures || [],
        documents: inspection.documents || [],
        client: inspection.client || 1,
      });
    }
  }, [inspection]);

  useEffect(() => {
    console.log("bulkStructuresStartSchedule", bulkStructuresStartSchedule);
    console.log("bulkStructuresEndSchedule", bulkStructuresEndSchedule);
  }, [bulkStructuresStartSchedule, bulkStructuresEndSchedule]);

  useEffect(() => {
    if (!session) return;

    const fetchAllClients = async () => {
      const query = qs.stringify(
        {
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
          },
        },
        {
          encodeValuesOnly: true, // This option is necessary to prevent qs from encoding the comma in the fields array
        }
      );

      if (session) {
        const apiParams = {
          jwt: session.accessToken, // Removed optional chaining as we already check session exists
          query: query,
        };

        try {
          const response = await getAllClients(apiParams);
          setClients(response.data.data);
        } catch (error) {
          console.error("Error fetching clients:", error);
        }
      }
    };

    const fetchTeams = async () => {
      const teams = await getAllTeams({
        jwt: session.accessToken,
        query: "",
      });
      setTeams(teams.data.data);
    };

    fetchAllClients();
    fetchTeams();
  }, [session]); // This useEffect depends on session

  /**
   * Toggles the visibility state of a UI drawer component.
   */

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const submitInspection = async () => {
    showLoading("Updating Inspection Map..."); // Assume you have a state to manage loading

    const payload = {
      data: {
        name: newInspection.name,
        client: newInspection.client.data.id,
      },
    };

    const apiParams = {
      jwt: session.accessToken,
      payload: payload,
      id: params.id,
      query: "",
    };

    try {
      if (inspection && inspection.id) {
        // Update logic here
        const response = await updateInspection(apiParams);
        const updatedInspection = {
          ...inspection,
          ...response.data.data.attributes,
          client: newInspection.client,
        };

        setInspection(updatedInspection);
      } else {
        // Creation logic here
        const response = await createInspection(apiParams);
        router.push(`/inspections/${response.data.data.id}`);
      }

      showSuccess();
    } catch (error) {
      showAlert("Error submitting inspection:", "failed");

      console.error("Error submitting inspection:", error);
    }
  };

  /**
   * Asynchronously creates a new structure entry in the database. After successful creation,
   * uploads any associated documents and images to the structure.
   *
   * Utilizes the global `structure` state for payload data, including name, type, longitude,
   * latitude, and an array of inspectors. Requires `auth` headers for API authorization.
   *
   * @async
   * @returns {Promise<Object>} The API response object if the structure is successfully created,
   *                            or an error object if the creation fails.
   */

  const createAndUploadStructure = async () => {
    const payload = {
      data: {
        inspection: inspection?.id,
        mapSection: structure.name,
        status: "Not Inspected",
        type: structure.type, // One of the enumeration options
        longitude: structure.longitude, // Example longitude
        latitude: structure.latitude, // Example latitude
      },
    };

    showLoading("Creating New Structure...");

    try {
      // Assume createStructure is imported or defined similar to createInspection
      const response = await createStructure({
        jwt: session.accessToken, // Assuming you're using session.accessToken for JWT
        payload: payload,
      });

      console.table("Structure created:", response.data);

      // If there are documents to upload
      if (
        (structure.documents && structure.documents.length > 0) ||
        (structure.images && structure.images.length > 0)
      ) {
        await uploadDocumentsAndImages(response.data.data.id);
      }

      setInspection({
        ...inspection,
        structures: {
          data: [...inspection?.structures.data, response.data.data],
        },
      });

      setStructure({
        name: "",
        type: "",
        longitude: 0,
        latitude: 0,
        documents: [],
        images: [],
      });

      await refreshInspection();
      showSuccess("Successfully updated!");

      return response;
    } catch (error) {
      console.error("Error creating structure:", error);
      // Adjust error handling as necessary
      if (error.response) {
        console.error("Error details:", error.response.data); // log the server's response
      }
      showError("There was an issue updating the inspection");
      return error;
    }
  };

  /**
   * Asynchronously uploads an array of files to a specified field within a structure entry.
   * The files are uploaded via a multipart/form-data POST request to a dedicated upload endpoint.
   *
   * @async
   * @param {File[]} files - An array of File objects to be uploaded.
   * @param {string} structureId - The ID of the structure to which the files are to be associated.
   * @param {string} fieldName - The name of the field within the structure entry to associate the uploaded files with.
   * @returns {Promise<void>} A promise that resolves when the upload operation is complete. Logs the outcome of the operation.
   */

  // Helper function to upload files to a specific field
  const uploadFiles = async (files, structureId, fieldName) => {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file); // Add each file to the form data
    });

    // Append reference data to link the uploaded files to the structure entry
    formData.append("ref", "api::structure.structure"); // Adjust according to your API path
    formData.append("refId", structureId);
    formData.append("field", fieldName); // Use the field name passed as a parameter

    try {
      // Make the POST request to upload and associate files with the structure entry
      const uploadResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
    } catch (error) {
      console.error(`Error uploading ${fieldName}:`, error);
    }
  };

  /**
   * Coordinates the uploading of both documents and images for a given structure entry.
   * Calls the `uploadFiles` function for each file type (documents and images) if files are present.
   *
   * @async
   * @param {string} structureId - The ID of the recently created structure entry.
   * @returns {Promise<void>} A promise that resolves once all files have been attempted to be uploaded.
   */

  const uploadDocumentsAndImages = async (structureId) => {
    if (structure.documents && structure.documents.length > 0) {
      await uploadFiles(structure.documents, structureId, "documents");
    }

    if (structure.images && structure.images.length > 0) {
      await uploadFiles(structure.images, structureId, "images");
    }
  };

  /**
   * Updates the longitude and latitude of a structure within the global `structure` state.
   *
   * @param {Object} coordinates - An object containing the new longitude and latitude values.
   * @param {number} coordinates.longitude - The new longitude value.
   * @param {number} coordinates.latitude - The new latitude value.
   */

  const updateStructureMarker = ({ longitude, latitude }) => {
    setStructure({ ...structure, latitude, longitude });
  };

  /**
   * Updates the document files associated with a structure in the global `structure` state.
   *
   * @param {File[]} files - An array of new document File objects to be associated with the structure.
   */

  const updateStructureDocuments = (files) => {
    setStructure({ ...structure, documents: files });
  };

  /**
   * Updates the image files associated with a structure in the global `structure` state.
   *
   * @param {File[]} files - An array of new image File objects to be associated with the structure.
   */

  const updateStructureImages = (files) => {
    setStructure({ ...structure, images: files });
  };

  /**
   * Updates the document files associated with an inspection in the global `inspection` state.
   *
   * @param {File[]} files - An array of new document File objects to be associated with the inspection.
   */

  const updateInspectionDocuments = async (files) => {
    try {
      const apiParams = {
        jwt: session?.accessToken,
        files: files,
        inspectionId: inspection.id,
        fieldName: "documents",
      };
      const uploadedDocuments = await uploadInspectionFiles(
        apiParams.jwt,
        apiParams.files,
        apiParams.inspectionId,
        apiParams.fieldName
      );
      setInspection({ ...inspection, documents: { data: files } });
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * Determines the color class for an inspection icon based on the inspection status.
   *
   * @param {string} status - The current status of the inspection.
   * @returns {string} The class name corresponding to the appropriate color for the given status.
   */

  const getInspectionIconColor = (status) => {
    if (status.toLowerCase() == "uploaded") return "text-green-600";
    if (status.toLowerCase() == "inspected") return "text-green-600";
    if (status.toLowerCase() == "not inspected") return "text-yellow-400";
    else return "text-red-600";
  };

  /**
   * Determines the text and background color classes for an inspection based on the inspection status.
   *
   * @param {string} status - The current status of the inspection.
   * @returns {string} The class names corresponding to the appropriate text and background colors for the given status.
   */

  const getInspectionColor = (status) => {
    if (status.toLowerCase() == "uploaded") return "text-white bg-green-800";
    if (status.toLowerCase() == "inspected")
      return "text-green-800 bg-green-100";
    if (status.toLowerCase() == "not inspected")
      return "text-yellow-800 bg-yellow-100";
    else return "text-red-800 bg-red-100";
  };

  /**
   * Searches for a client object within an array of client objects by a given id.
   *
   * @param {Object[]} clientArray - The array of client objects to search through. Each client object must have an 'id' property.
   * @param {number} id - The unique identifier of the client object to find.
   * @returns {Object|undefined} Returns the client object with the matching id. If no client object matches the id, returns undefined.
   *
   * @example
   * const clients = [
   *   { id: 1, attributes: { name: 'Glendale Gas & Power' } },
   *   { id: 2, attributes: { name: 'Phoenix Gas & Power' } },
   *   // more clients...
   * ];
   *
   * const client = findClientById(clients, 2);
   * // Output: { id: 2, attributes: { name: 'Phoenix Gas & Power' } }
   */
  const findClientById = (clientArray, id) => {
    const result = clientArray.find((client) => client.id == id);
    return result;
  };

  const handleCheckboxChange = (event, structure) => {
    if (event.target.checked) {
      setSelectedStructures([...selectedStructures, structure]);
    } else {
      setSelectedStructures(
        selectedStructures.filter((s) => s.id !== structure.id)
      );
    }
  };

  const handleSelectAllCheckboxs = (event) => {
    if (event.target.checked) {
      setSelectedStructures(
        inspection?.structures.data.map((structure) => structure)
      );
    } else {
      setSelectedStructures([]);
    }
  };

  const bulkCreateStructures = async (data) => {
    if (!session) return;
    const { jwt, structures } = data;
    const requests = structures.map((structure) =>
      axios.post(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/structures`,
        { data: structure },
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      )
    );

    try {
      const allStructureRequest = await axios.all(requests);
      // runs and updates the page with all the structures
      await refreshInspection();
    } catch (error) {
      console.error(error);
    }
  };

  const bulkUpdateStructuresStatus = async () => {
    if (!session) return;

    showLoading(`Updating ${selectedStructures.length} Structures`);

    try {
      const allResponses = await Promise.all(
        selectedStructures.map(async (structure) => {
          const apiParams = {
            jwt: session.accessToken,
            id: structure.id,
            query: "",
            payload: {
              data: {
                status: bulkStructuresStatus,
              },
            },
          };

          const currentDate = new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD

          if (bulkStructuresStatus === "Inspected") {
            apiParams.payload.data.inspectionDate = currentDate;
          }

          if (bulkStructuresStatus === "Uploaded") {
            apiParams.payload.data.uploadDate = currentDate;
          }

          const response = await updateStructure(apiParams);
          return response;
        })
      );

      await refreshInspection();
      showSuccess("Finished All Structures");
      return allResponses;
    } catch (error) {
      console.error(error);
    }
  };

  const bulkUpdateStructuresType = async () => {
    if (!session) return;

    showLoading(`Updating ${selectedStructures.length} Structures`);

    try {
      const allResponses = await Promise.all(
        selectedStructures.map(async (structure) => {
          const apiParams = {
            jwt: session.accessToken,
            id: structure.id,
            query: "",
            payload: {
              data: {
                type: bulkStructuresType,
              },
            },
          };

          const response = await updateStructure(apiParams);
          return response;
        })
      );

      await refreshInspection();
      showSuccess("Finished All Structures");
      return allResponses;
    } catch (error) {
      console.error(error);
    }
  };

  const bulkUpdateStructuresSchedule = async (scheduleStart, scheduleEnd) => {
    if (!session) return;

    showLoading(`Updating ${selectedStructures.length} Structures`);

    try {
      const allResponses = await Promise.all(
        selectedStructures.map(async (structure) => {
          const apiParams = {
            jwt: session.accessToken,
            id: structure.id,
            query: "", // Make sure this is correctly formatted
            payload: {
              data: {
                team: bulkStructuresTeam,
                scheduleStart: bulkStructuresStartSchedule,
                scheduleEnd: bulkStructuresEndSchedule,
              },
            },
          };

          const response = await updateStructure(apiParams);
          return response;
        })
      );

      await refreshInspection();
      showSuccess("Finished All Structures");
      return allResponses;
    } catch (error) {
      console.error(error);
      showError("Failed to update structures");
      return []; // Return an empty array or handle the error appropriately
    }
  };

  const CsvUpload = () => {
    const [uploadedStructures, setUploadedStructures] = useState([]);
    const [duplicateWarning, setDuplicateWarning] = useState(false);

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const data = results.data.map((item) => ({
              mapSection: item.name,
              type: item.type,
              inspection: inspection?.id,
              isDuplicate: false,
            }));
            checkForDuplicates(data);
          },
        });
      }
    };

    const checkForDuplicates = (uploadedData) => {
      const existingNames = inspection?.structures.data.map(
        (structure) => structure.attributes.mapSection
      );
      const updatedData = uploadedData.map((item) => {
        if (existingNames.includes(item.mapSection)) {
          item.isDuplicate = true;
          setDuplicateWarning(true);
        }
        return item;
      });
      setUploadedStructures(updatedData);
    };

    const handleBulkCreate = async () => {
      const jwt = "your-jwt-token-here"; // Replace with your JWT token
      try {
        const validStructures = uploadedStructures.filter(
          (structure) => !structure.isDuplicate
        );
        await bulkCreateStructures({ jwt, structures: validStructures });
      } catch (error) {
        console.error("Error creating structures:", error);
      }
    };

    const removeUploadedStructure = (index) => {
      const updatedStructures = uploadedStructures.filter(
        (_, i) => i !== index
      );
      setUploadedStructures(updatedStructures);
      setDuplicateWarning(
        updatedStructures.some((structure) => structure.isDuplicate)
      );
    };

    return (
      <>
        {uploadedStructures.length === 0 && (
          <div className="flex bg-gray-100 h-60 w-full items-center justify-center rounded-lg overflow-hidden">
            <label
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
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  CSV (MAX. 800x400px)
                </p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                accept=".csv"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        )}

        {uploadedStructures.length > 0 && (
          <div>
            <div className="flex justify-between mb-4">
              <h3 className="font-medium text-gray-900 dark:text-white text-xs">
                Uploaded Structures
              </h3>
              {duplicateWarning && (
                <p className="font-medium dark:text-white text-xs text-red-500">
                  Warning: Duplicate names found!
                </p>
              )}
            </div>

            <div className="flex bg-gray-100 p-4 h-60 mb-1 rounded-lg overflow-hidden">
              <div className="rounded-md w-full  overflow-auto">
                {uploadedStructures.map((structure, index) => (
                  <div
                    key={index}
                    className={`group flex flex-row cursor-pointer justify-between items-center border-0 border-b-2 border-gray-100 w-full p-4 mb-0 ${
                      structure.isDuplicate ? "bg-red-100" : "bg-white"
                    }`}
                  >
                    <div className="flex">
                      <MdLocationPin
                        className={`${getInspectionIconColor(
                          structure.status || "Not Inspected"
                        )} text-xs font-medium me-2 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300`}
                        style={{ width: 40, height: 40 }}
                      />
                      <div className="flex flex-col justify-center pt-0 pb-0 pl-4 pr-4 leading-normal">
                        <h5 className="flex flex-shrink-0 mb-1 text-sm font-bold tracking-tight text-gray-900 dark:text-white">
                          {structure.mapSection}
                          <span className="flex items-center font-light ml-1">
                            / {structure.type}
                          </span>
                        </h5>
                      </div>
                    </div>
                    <button
                      onClick={() => removeUploadedStructure(index)}
                      className="hidden group-hover:block ml-4 w-6 h-6 bg-red-500 text-white rounded-full"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleBulkCreate}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Bulk Create Structures
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <div>
      <Button
        onClick={toggleDrawer}
        className="bg-dark-blue-700 text-white w-full shrink-0 self-start"
      >
        <p className="mr-3">{btnText || "New Map"}</p>
        {showIcon && <GoGear size={17} color="white" />}
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
            <Breadcrumb.Item href="/">
              {inspection?.name ? inspection?.name : "Map Name Here"}
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
              formView === "inspection"
                ? "translate-x-0"
                : "-translate-x-full hidden"
            }`}
          >
            <div id="new-inspection-form" className="flex flex-col gap-7 p-10">
              <div className="flex flex-col gap-2">
                <h3 className="leading-tight text-2xl font-medium">
                  Edit{" "}
                  {inspection?.name === "" ? (
                    <span>&quot;Map Name Here&quot;</span>
                  ) : (
                    <span>&quot;{inspection?.name}&quot;</span>
                  )}
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
                  value={newInspection.name || ""}
                  onChange={(e) => {
                    setNewInspection({
                      ...newInspection,
                      name: e.target.value,
                    });
                  }}
                />
              </div>

              <div className="flex flex-col">
                <div className="mb-2 block">
                  <Label htmlFor="client" value="Select Client" />
                </div>
                <Select
                  id="client"
                  required
                  defaultValue={inspection?.client.data.id || ""}
                  onChange={(e) => {
                    setNewInspection({
                      ...newInspection,
                      client: { data: findClientById(clients, e.target.value) },
                    });
                  }}
                >
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.attributes.name}
                    </option>
                  ))}
                </Select>
              </div>

              {inspection && (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between">
                    <Label className="text-xs" htmlFor="inspectionName">
                      Map Structures
                    </Label>
                    <button
                      className="flex align-middle text-xs font-medium text-dark-blue-700"
                      onClick={() => setFormView("structure")}
                    >
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

                  {selectedStructures.length > 0 && (
                    <div className="px-4 py-2 border border-gray-200 bg-white rounded-md">
                      <div className="flex justify-between">
                        <div className="flex gap-2">
                          <p className=" text-xs my-auto">Selected </p>
                          <Badge color="gray" className="rounded-full my-auto">
                            {selectedStructures.length}
                          </Badge>
                        </div>
                        <div className="flex gap-3">
                          <div
                            className="p-2 rounded-md border border-gray-200 hover:border-gray-900 hover:text-gray-900 cursor-pointer text-gray-300"
                            onClick={() => setBulkUpdateView("status")}
                          >
                            <FaListCheck className="my-auto h-3" />
                          </div>
                          <div
                            className="p-2 rounded-md border border-gray-200 hover:border-gray-900 hover:text-gray-900 cursor-pointer text-gray-300"
                            onClick={() => setBulkUpdateView("type")}
                          >
                            <FaRegBuilding className="my-auto h-3" />
                          </div>
                          <div
                            className="p-2 rounded-md border border-gray-200 hover:border-gray-900 hover:text-gray-900 cursor-pointer text-gray-300"
                            onClick={() => setBulkUpdateView("schedule")}
                          >
                            <FaRegCalendarCheck className="my-auto h-3" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {bulkUpdateView === "type" &&
                    selectedStructures.length > 0 && (
                      <div className="flex flex-col p-4 border border-gray-200 bg-white rounded-md gap-4">
                        <div className="flex flex-col gap-2">
                          <Label className="text-xs" htmlFor="structureType">
                            Structure Type
                          </Label>
                          <select
                            id="structureType"
                            className="pl-0 border-x-0 border-t-0 border-b-2 border-b-gray-200"
                            value={bulkStructuresType}
                            onChange={(e) =>
                              setBulkStructuresType(e.target.value)
                            }
                          >
                            {structureTypes.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                        </div>
                        <Button
                          className="bg-dark-blue-700"
                          onClick={() => bulkUpdateStructuresType()}
                        >
                          Save Structures
                        </Button>
                      </div>
                    )}

                  {bulkUpdateView === "status" &&
                    selectedStructures.length > 0 && (
                      <div className="flex flex-col p-4 border border-gray-200 bg-white rounded-md gap-4">
                        <div className="flex flex-col gap-2">
                          <Label className="text-xs" htmlFor="structureStatus">
                            Structure Status
                          </Label>
                          <select
                            id="structureStatus"
                            className="pl-0 border-x-0 border-t-0 border-b-2 border-b-gray-200"
                            defaultValue={bulkStructuresStatus}
                            onChange={(e) =>
                              setBulkStructuresStatus(e.target.value)
                            }
                          >
                            {structureStatuses.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                        </div>
                        <Button
                          className="bg-dark-blue-700"
                          onClick={() => bulkUpdateStructuresStatus()}
                        >
                          Save Structures
                        </Button>
                      </div>
                    )}

                  {bulkUpdateView === "schedule" &&
                    selectedStructures.length > 0 && (
                      <div className="flex flex-col p-4 border border-gray-200 bg-white rounded-md gap-4">
                        <div className="flex flex-col gap-2">
                          <label
                            className="text-xs mb-2"
                            htmlFor="structureLatitude"
                          >
                            Schedule For Inspection
                          </label>
                          <select
                            id="inspectionTeam"
                            className="pl-0 border-x-0 border-t-0 border-b-2 border-b-gray-200"
                            value={bulkStructuresTeam}
                            onChange={(e) => {
                              setBulkStructuresTeam(e.target.value);
                            }}
                          >
                            <option value={"Select a Team"}>
                              Select a Team
                            </option>
                            {teams.map((team, index) => (
                              <option key={index} value={team.id}>
                                {team.attributes.name}
                              </option>
                            ))}
                          </select>
                          <Datepicker
                            title="Flowbite Datepicker"
                            className="w-full bg-white"
                            onSelectedDateChanged={(date) =>
                              setBulkStructuresStartSchedule(date)
                            }
                          />
                          <Datepicker
                            title="Flowbite Datepicker"
                            className="w-full bg-white"
                            onSelectedDateChanged={(date) =>
                              setBulkStructuresEndSchedule(date)
                            }
                          />
                        </div>
                        <Button
                          className="bg-dark-blue-700"
                          onClick={() => bulkUpdateStructuresSchedule()}
                        >
                          Save Structures
                        </Button>
                      </div>
                    )}

                  <div className="flex flex-col bg-gray-100 p-4 h-72 mb-1 rounded-lg overflow-hidden">
                    {selectedStructures.length > 0 && (
                      <div
                        className={`flex flex-row cursor-pointer justify-between items-center bg-white border border-gray-100 w-full dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 px-4 py-3 mb-2 rounded-md`}
                      >
                        <div className="flex">
                          <Checkbox
                            className="my-auto"
                            onChange={(e) => handleSelectAllCheckboxs(e)}
                          />

                          <div className="flex flex-col justify-between pt-0 pb-0 pl-5 pr-4 leading-normal">
                            <h5 className="flex flex-shrink-0 font-base text-xs tracking-tight text-gray-700 dark:text-white">
                              Select All
                            </h5>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="rounded-md w-full  overflow-auto px-0">
                      {inspection?.structures.data.map((structure, index) => (
                        <div
                          key={index}
                          className={`flex flex-row cursor-pointer justify-between items-center bg-white border-0 border-b-2 border-gray-100 w-full hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 p-4 mb-0`}
                        >
                          <div className="flex">
                            <Checkbox
                              className="my-auto"
                              onChange={(e) =>
                                handleCheckboxChange(e, structure)
                              }
                              checked={selectedStructures.some(
                                (item) => item.id === structure.id
                              )}
                            />
                            <div className="flex flex-col justify-between pt-0 pb-0 pl-5 pr-4 leading-normal">
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
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <CsvUpload />
                </div>
              )}

              <ImageCardGrid
                files={inspection?.documents.data || []}
                updateFiles={updateInspectionDocuments}
                labelText={"Inspection Documents"}
                identifier={"inspection-documents"}
                editMode={true}
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
                <div className="flex bg-100 justify-end">
                  {isLoadingInspection && <Spinner />}
                  <Button
                    className="bg-dark-blue-700"
                    onClick={() => submitInspection()}
                  >
                    Save Inspection
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {inspection && (
            <div
              className={`absolute inset-0 transition-transform duration-500 transform ${
                formView === "structure"
                  ? "translate-x-0"
                  : "translate-x-full hidden"
              }`}
            >
              <div
                id="new-structure-form"
                className="flex flex-col gap-7 p-10 relative"
              >
                {loadingNewStructure && (
                  <div className="flex absolute left-0 right-0 bottom-0 top-0 z-50 bg-red-600 justify-center align-middle">
                    <div className="m-auto">
                      <p>Creating New Structure</p>
                      <Spinner />
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <h6
                    className=" text-dark-blue-700 text-xs flex gap-0.5 cursor-pointer font-semibold"
                    onClick={() => {
                      setFormView("inspection");
                    }}
                  >
                    <MdArrowBackIos size={10} />
                    Back
                  </h6>
                  <h3 className="leading-tight text-2xl font-medium">
                    Edit{" "}
                    {inspection?.name === "" ? (
                      <span>&quot;Structure Name Here&quot;</span>
                    ) : (
                      <span>&quot;{inspection?.name}&quot;</span>
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
                    value={structure.name || ""}
                    onChange={(e) =>
                      setStructure({ ...structure, name: e.target.value })
                    }
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-xs" htmlFor="structureType">
                    Structure Type
                  </Label>
                  <select
                    id="structureType"
                    className="pl-0 border-x-0 border-t-0 border-b-2 border-b-gray-200"
                    value={structure?.type || "Standard Vault"}
                    onChange={(e) =>
                      setStructure({ ...structure, type: e.target.value })
                    }
                  >
                    <option value="Standard Vault">Standard Vault</option>
                    <option value="Pull Box">Pull Box</option>
                    <option value="Wood Pole">Wood Pole</option>
                    <option value="Man Hole">Man Hole</option>
                    <option value="Street Light">Street Light</option>
                    <option value="Pad Vault">Pad Vault</option>
                    <option value="Beehive">Beehive</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-xs" htmlFor="structureStatus">
                    Structure Status
                  </Label>
                  <select
                    id="structureStatus"
                    className="pl-0 border-x-0 border-t-0 border-b-2 border-b-gray-200"
                    defaultValue={structure?.status || ""}
                    onChange={(e) => {
                      setStructure({ ...structure, status: e.target.value });
                    }}
                  >
                    <option value="Not Inspected">Not Inspected</option>
                    <option value="Uploaded">Uploaded</option>
                    <option value="Inspected">Inspected</option>
                    <option value="Cannot Locate">Cannot Locate</option>
                  </select>
                </div>

                <div className="flex flex-row gap-3">
                  <div className="flex flex-col w-full">
                    <Label className="text-xs" htmlFor="longCords">
                      Longitude
                    </Label>
                    <input
                      className="border-b-2 border-x-0 border-t-0 border-b-gray-200 pl-0"
                      type="number"
                      id="longCords"
                      placeholder="Longitude Cordinates"
                      value={structure?.longitude || ""}
                      onChange={(e) =>
                        setStructure({
                          ...structure,
                          longitude: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="flex flex-col w-full">
                    <Label className="text-xs" htmlFor="latCords">
                      Latitude
                    </Label>
                    <input
                      className="border-b-2 border-x-0 border-t-0 border-b-gray-200 pl-0"
                      type="number"
                      id="latCords"
                      placeholder="Latitude Cordinates"
                      value={structure.latitude || ""}
                      onChange={(e) =>
                        setStructure({
                          ...structure,
                          latitude: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                {/* <ImageCardGrid
                  files={structure.documents}
                  updateFiles={updateStructureDocuments}
                  labelText={"Structure Documents"}
                  identifier={"structure-documents"}
                  editMode={true}
                />

                <ImageCardGrid
                  files={structure.images}
                  updateFiles={updateStructureImages}
                  labelText={"Structure Assets"}
                  identifier={"structure-assets"}
                  editMode={true}
                /> */}

                <div className="flex bg-100 justify-end">
                  {/* <Button
                    className="bg-dark-blue-700"
                    onClick={() => setFormView("inspection")}
                  >
                    Back
                  </Button> */}
                  <Button
                    className="bg-dark-blue-700"
                    onClick={() => createAndUploadStructure()}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InspectionDrawer;
