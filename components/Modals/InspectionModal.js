"use client";

import {
  Modal,
  FileInput,
  Button,
  Checkbox,
  Label,
  TextInput,
  Select,
  Spinner,
} from "flowbite-react";
import { useEffect } from "react";
import Link from "next/link";
import { FaPlus } from "react-icons/fa";
import { useState } from "react";
import { useSession } from "next-auth/react";
import * as toGeoJSON from "@tmcw/togeojson";
import { useRouter } from "next/navigation";

import axios from "axios";

export default function InspectionModal() {
  const { data: session } = useSession();
  const router = useRouter();

  const [openModal, setOpenModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [name, setName] = useState("");
  const [selectedClientId, setSelectedClientId] = useState(""); // State to store the selected client ID
  const [isLoading, setIsLoading] = useState(false);
  const [kmlFile, setKmlFile] = useState(null);

  useEffect(() => {
    const fetchInspectionData = async () => {
      if (session?.accessToken) {
        try {
          const [clientResponse] = await Promise.all([
            axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/clients`, {
              headers: { Authorization: `Bearer ${session.accessToken}` },
            }),
          ]);

          setClients(clientResponse.data.data);
        } catch (error) {
          console.error("Error fetching data", error.response || error);
        }
      }
    };

    fetchInspectionData();
  }, [session]);

  const handleFileChange = (e) => {
    setKmlFile(e.target.files[0]); // Update the state with the new file
  };

  const convertFileToGeoJSON = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dom = new DOMParser().parseFromString(
          e.target.result,
          "text/xml"
        );
        try {
          // Make sure to use the correct import for the toGeoJSON function
          const geoJson = toGeoJSON.kml(dom); // If toGeoJSON is imported as an object
          // const geoJson = toGeoJSON(dom); // If toGeoJSON is imported as a default function
          resolve(geoJson);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const createInspection = async () => {
    setIsLoading(true);

    const inspectionData = {
      data: {
        name: name,
        client: selectedClientId,
      },
    };

    if (session?.accessToken) {
      try {
        const clientResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/inspections`,
          inspectionData, // the data to be sent in the POST request
          {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          }
        );

        setIsLoading(false);

        // After receiving the response from the POST request
        const inspectionId = clientResponse.data.data.id;

        // Optionally wait a second or two for the server to index the new data
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Now push to the new route
        router
          .push(`/inspections/${inspectionId}`)
          .catch((e) => console.error(e));

        return clientResponse;
      } catch (error) {
        console.error("Error fetching data", error.response || error);
      }
    }
  };

  return (
    <>
      <Button onClick={() => setOpenModal(true)}>
        <span className="pr-3">New Inspection</span>
        <FaPlus />
      </Button>
      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <Modal.Header>Terms of Service</Modal.Header>
        <Modal.Body>
          {isLoading ? (
            <Spinner aria-label="Extra large spinner example" size="xl" />
          ) : (
            <form
              className="flex w-full flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                createInspection();
              }}
            >
              <div>
                <div className="mb-2 block">
                  <Label
                    htmlFor="inspectionName"
                    value="Inspection Name / Map ID"
                  />
                </div>
                <TextInput
                  id="inspectionName"
                  type="text"
                  required
                  value={name} // Controlled component: value is always driven by the React state
                  onChange={(e) => {
                    setName(e.target.value); // Update the state with the new value
                  }}
                />
              </div>
              <div className="w-full">
                <div className="mb-2 block">
                  <Label htmlFor="clients" value="Select The Client" />
                </div>
                <Select
                  id="clients"
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)} // Update the state when an option is selected
                  required
                >
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.attributes.name}
                    </option>
                  ))}
                </Select>
              </div>

              <Button type="submit">I accept</Button>
            </form>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}
