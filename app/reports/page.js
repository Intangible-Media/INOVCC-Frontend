"use client";

import { useState } from "react";
import { fetchAllStructure } from "../../utils/api/structures";
import qs from "qs"; // Assuming qs is already installed
import { useSession } from "next-auth/react";
import StructuresTableAlt from "../../components/Tables/StructuresTableAlt"; // Adjust import based on your project structure
import { TextInput, Select, Button, Label, Datepicker } from "flowbite-react";
export default function Page() {
  const { data: session } = useSession();
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

  const [structures, setStructures] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const buildQuery = () => {
    const queryFilters = [];

    // Add filters to the query only if they have a value
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        const filterCondition = {
          [key]: {
            $containsi: filters[key],
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

    console.log("query", query);

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

    console.log("structure", structures);

    setStructures(structures.data);
  };

  return (
    <section className="grid md:grid-cols-4 p-0 rounded-md gap-4 my-4 ">
      {/* Form to build query */}
      <div className="col-span-1 bg-white p-6 rounded-md max-h-[600px] overflow-auto">
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
        <div>
          <Label
            htmlFor="scheduleForInspection"
            value="Schedule For Inspection"
          />
          <Datepicker
            id="scheduleForInspection"
            name="scheduleForInspection"
            selected={filters.scheduleForInspection}
            onChange={(date) => handleDateChange("scheduleForInspection", date)}
            placeholder="Select schedule date"
          />
        </div>
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
        <div className="">
          <Button type="submit" className="w-full" onClick={handleSubmit}>
            Fetch Data
          </Button>
        </div>
      </div>

      {/* Display Table */}
      <div className="col-span-3">
        <StructuresTableAlt structures={structures} />
      </div>
    </section>
  );
}
