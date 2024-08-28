"use client";

import { useState } from "react";
import { fetchAllStructure } from "../../utils/api/structures";
import qs from "qs"; // Assuming qs is already installed
import { useSession } from "next-auth/react";
import StructuresTableAlt from "../../components/Tables/StructuresTableAlt"; // Adjust import based on your project structure
import {
  TextInput,
  Select,
  Button,
  Label,
  Datepicker,
  Modal,
  Checkbox,
} from "flowbite-react";

export default function Page() {
  const { data: session } = useSession();

  // Define the initial filters state
  const [filters, setFilters] = useState({
    status: "",
    mapSection: "",
    inspectionDate: "",
    type: "",
    longitude: "",
    latitude: "",
    scheduleForInspection: "",
    uploadDate: "",
    billed: "",
    scheduleStart: "",
    scheduleEnd: "",
    wpPassFail: "",
    adminStatus: "",
    favorited: "",
  });

  // Define the available fields
  const availableFields = [
    "status",
    "mapSection",
    "inspectionDate",
    "type",
    "longitude",
    "latitude",
    "scheduleForInspection",
    "uploadDate",
    "billed",
    "scheduleStart",
    "scheduleEnd",
    "wpPassFail",
    "adminStatus",
    "favorited",
  ];

  const [selectedFields, setSelectedFields] = useState([]);
  const [structures, setStructures] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleDateChange = (name, date) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: date,
    }));
  };

  const buildQuery = () => {
    const queryFilters = [];

    // Add filters to the query only if they have a value
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        const filterCondition = {
          [key]: {
            $eq: filters[key],
          },
        };
        queryFilters.push(filterCondition);
      }
    });

    // Build the final query object
    const query = {
      filters: {
        ...(queryFilters.length > 0 && {
          $and: queryFilters,
        }),
      },
      sort: ["mapSection:asc"], // Sort by mapSection in alphabetical order
    };

    return qs.stringify(query, {
      encodeValuesOnly: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session) return;
    const query = buildQuery();

    // Fetch the data using the constructed query
    const structures = await fetchAllStructure({
      jwt: session.accessToken, // Ensure you have session data or adjust accordingly
      query,
    });

    setStructures(structures.data);
  };

  const toggleFieldSelection = (field) => {
    setSelectedFields((prevFields) =>
      prevFields.includes(field)
        ? prevFields.filter((f) => f !== field)
        : [...prevFields, field]
    );
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <section className="grid md:grid-cols-4 p-0 rounded-md gap-4 my-4 ">
      {/* Button to open modal */}

      {/* Modal for selecting fields */}
      <Modal show={isModalOpen} onClose={handleCloseModal}>
        <Modal.Header>Select Fields</Modal.Header>
        <Modal.Body>
          {availableFields.map((field) => (
            <div key={field} className="mb-2">
              <Checkbox
                id={field}
                value={field}
                checked={selectedFields.includes(field)}
                onChange={() => toggleFieldSelection(field)}
              />
              <Label htmlFor={field} className="ml-2">
                {field}
              </Label>
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleCloseModal}>Done</Button>
        </Modal.Footer>
      </Modal>

      {/* Form to build query */}
      <div className="flex flex-col gap-3 col-span-1 bg-white p-6 rounded-md h-fit max-h-[600px] overflow-auto">
        {selectedFields.includes("status") && (
          <div>
            <Label htmlFor="status" value="Status" />
            <TextInput
              id="status"
              name="status"
              value={filters.status}
              onChange={handleInputChange}
              placeholder="Enter status"
            />
          </div>
        )}
        {selectedFields.includes("mapSection") && (
          <div>
            <Label htmlFor="mapSection" value="Map Section" />
            <TextInput
              id="mapSection"
              name="mapSection"
              value={filters.mapSection}
              onChange={handleInputChange}
              placeholder="Enter map section"
            />
          </div>
        )}
        {selectedFields.includes("inspectionDate") && (
          <div>
            <Label htmlFor="inspectionDate" value="Inspection Date" />
            <Datepicker
              id="inspectionDate"
              name="inspectionDate"
              selected={filters.inspectionDate}
              onChange={(date) => handleDateChange("inspectionDate", date)}
              placeholder="Select inspection date"
            />
          </div>
        )}
        {selectedFields.includes("type") && (
          <div>
            <Label htmlFor="type" value="Type" />
            <TextInput
              id="type"
              name="type"
              value={filters.type}
              onChange={handleInputChange}
              placeholder="Enter type"
            />
          </div>
        )}
        {selectedFields.includes("longitude") && (
          <div>
            <Label htmlFor="longitude" value="Longitude" />
            <TextInput
              id="longitude"
              type="number"
              name="longitude"
              value={filters.longitude}
              onChange={handleInputChange}
              placeholder="Enter longitude"
            />
          </div>
        )}
        {selectedFields.includes("latitude") && (
          <div>
            <Label htmlFor="latitude" value="Latitude" />
            <TextInput
              id="latitude"
              type="number"
              name="latitude"
              value={filters.latitude}
              onChange={handleInputChange}
              placeholder="Enter latitude"
            />
          </div>
        )}
        {selectedFields.includes("scheduleForInspection") && (
          <div>
            <Label
              htmlFor="scheduleForInspection"
              value="Schedule For Inspection"
            />
            <Datepicker
              id="scheduleForInspection"
              name="scheduleForInspection"
              selected={filters.scheduleForInspection}
              onChange={(date) =>
                handleDateChange("scheduleForInspection", date)
              }
              placeholder="Select schedule date"
            />
          </div>
        )}
        {selectedFields.includes("uploadDate") && (
          <div>
            <Label htmlFor="uploadDate" value="Upload Date" />
            <Datepicker
              id="uploadDate"
              name="uploadDate"
              selected={filters.uploadDate}
              onChange={(date) => handleDateChange("uploadDate", date)}
              placeholder="Select upload date"
            />
          </div>
        )}
        {selectedFields.includes("billed") && (
          <div>
            <Label htmlFor="billed" value="Billed" />
            <Select
              id="billed"
              name="billed"
              value={filters.billed}
              onChange={handleInputChange}
            >
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </Select>
          </div>
        )}
        {selectedFields.includes("scheduleStart") && (
          <div>
            <Label htmlFor="scheduleStart" value="Schedule Start" />
            <Datepicker
              id="scheduleStart"
              name="scheduleStart"
              selected={filters.scheduleStart}
              onChange={(date) => handleDateChange("scheduleStart", date)}
              placeholder="Select start date"
            />
          </div>
        )}
        {selectedFields.includes("scheduleEnd") && (
          <div>
            <Label htmlFor="scheduleEnd" value="Schedule End" />
            <Datepicker
              id="scheduleEnd"
              name="scheduleEnd"
              selected={filters.scheduleEnd}
              onChange={(date) => handleDateChange("scheduleEnd", date)}
              placeholder="Select end date"
            />
          </div>
        )}
        {selectedFields.includes("wpPassFail") && (
          <div>
            <Label htmlFor="wpPassFail" value="WP Pass/Fail" />
            <TextInput
              id="wpPassFail"
              name="wpPassFail"
              value={filters.wpPassFail}
              onChange={handleInputChange}
              placeholder="Enter WP Pass/Fail"
            />
          </div>
        )}
        {selectedFields.includes("adminStatus") && (
          <div>
            <Label htmlFor="adminStatus" value="Admin Status" />
            <TextInput
              id="adminStatus"
              name="adminStatus"
              value={filters.adminStatus}
              onChange={handleInputChange}
              placeholder="Enter admin status"
            />
          </div>
        )}
        {selectedFields.includes("favorited") && (
          <div>
            <Label htmlFor="favorited" value="Favorited" />
            <Select
              id="favorited"
              name="favorited"
              value={filters.favorited}
              onChange={handleInputChange}
            >
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </Select>
          </div>
        )}
        <div className="flex gap-2 mt-4">
          <Button
            onClick={handleOpenModal}
            className="w-full border border-dark-blue-700 text-dark-blue-700 bg-transparent"
          >
            Select Fields
          </Button>
          <Button
            type="submit"
            className="w-full bg-dark-blue-700 text-white"
            onClick={handleSubmit}
          >
            Fetch Data
          </Button>
        </div>
      </div>

      {/* Display Table */}
      <div className="col-span-3 bg-white p-6 rounded-md">
        <StructuresTableAlt structures={structures} />
      </div>
    </section>
  );
}
