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
import axios from "axios";

export default function InspectionModal() {
  const { data: session } = useSession();

  const [openModal, setOpenModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [name, setName] = useState("");
  const [selectedClientId, setSelectedClientId] = useState(""); // State to store the selected client ID
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchInspectionData = async () => {
      if (session?.accessToken) {
        try {
          const [clientResponse] = await Promise.all([
            axios.get(`http://localhost:1337/api/clients`, {
              headers: { Authorization: `Bearer ${session.accessToken}` },
            }),
          ]);

          console.log(clientResponse.data.data);

          setClients(clientResponse.data.data);
        } catch (error) {
          console.error("Error fetching data", error.response || error);
        }
      }
    };

    fetchInspectionData();
  }, [session]);

  const createInspection = async () => {
    setIsLoading(true);

    console.log(name);
    console.log(selectedClientId);

    const inspectionData = {
      data: {
        name: name,
        client: selectedClientId,
      },
    };

    console.log("before the if statement");

    if (session?.accessToken) {
      console.log("inside the if statement");
      try {
        const clientResponse = await axios.post(
          `http://localhost:1337/api/inspections`,
          inspectionData, // the data to be sent in the POST request
          {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          }
        );

        setIsLoading(false);

        return clientResponse;
      } catch (error) {
        console.error("Error fetching data", error.response || error);
      }
    }

    console.log("outside the if statement");
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
              <div id="fileUpload" className="w-full">
                <div className="mb-2 block">
                  <Label htmlFor="file" value="Upload file" />
                </div>
                <FileInput id="file" />
              </div>
              <Button type="submit">I accept</Button>
            </form>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}
