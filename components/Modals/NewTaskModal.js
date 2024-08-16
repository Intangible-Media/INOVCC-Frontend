"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Modal,
  TextInput,
  Textarea,
  Select,
  Label,
  Datepicker,
  FileInput,
} from "flowbite-react"; // Import FileInput
import AvatarImage from "../AvatarImage";
import { getAllUsers } from "../../utils/api/users";
import { useSession } from "next-auth/react";
import { createTask, uploadFiles } from "../../utils/api/tasks";
import { refreshTaskData } from "../../app/actions"; // Import revalidatePath

export default function NewTaskModal() {
  const { data: session } = useSession();
  const [openModal, setOpenModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("low");
  const [dueDate, setDueDate] = useState(null);
  const [assignedInspector, setAssignedInspector] = useState(null);
  const [availableInspectors, setAvailableInspectors] = useState([]);
  const [documents, setDocuments] = useState([]); // State for handling file uploads
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    if (!session) return;

    async function fetchUsers() {
      const users = await getAllUsers({ jwt: session.accessToken, query: "" });
      setAvailableInspectors(users.data);
    }

    fetchUsers();
  }, [session]);

  useEffect(() => {
    // Check if all required fields are filled
    if (title && description && urgency && dueDate && assignedInspector) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [title, description, urgency, dueDate, assignedInspector]);

  const handleAssignInspector = (userId) => {
    const selectedInspector = availableInspectors.find(
      (user) => user.id == userId
    );
    setAssignedInspector(selectedInspector);
  };

  const handleRemoveInspector = () => {
    setAssignedInspector(null);
  };

  const handleFileChange = (e) => {
    setDocuments(e.target.files); // Handle file selection
  };

  const handleSubmit = async (e) => {
    if (!session) return;
    e.preventDefault();

    const payload = {
      title,
      description,
      urgency,
      dueDate: dueDate ? dueDate : "",
      assigned: assignedInspector ? assignedInspector.id : null,
    };

    try {
      // Create the task first
      const response = await createTask({
        jwt: session.accessToken,
        payload: { data: payload },
        query: "",
      });

      const taskId = response.data.data.id;

      // If there are documents, upload them
      if (documents.length > 0) {
        const documentsArray = Array.from(documents); // Convert FileList to an array
        await uploadFiles(
          session.accessToken,
          documentsArray,
          taskId,
          "documents"
        );
      }

      // Revalidate the path after successfully creating the task
      refreshTaskData("/tasks");

      setOpenModal(false);
    } catch (error) {
      console.error("Failed to create task or upload files:", error);
    }
  };

  return (
    <>
      <Button
        className="bg-dark-blue-700 text-white w-full shrink-0 self-start"
        onClick={() => setOpenModal(true)}
      >
        New Task
      </Button>

      <Modal show={openModal} onClose={() => setOpenModal(false)} size="xl">
        <Modal.Header>Create New Task</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title" value="Title" />
              <TextInput
                id="title"
                type="text"
                placeholder="Enter task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="description" value="Description" />
              <Textarea
                id="description"
                placeholder="Enter task description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>
            <div>
              <Label htmlFor="urgency" value="Urgency" />
              <Select
                id="urgency"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="dueDate" value="Due Date" />
              <Datepicker
                id="dueDate"
                onSelectedDateChanged={(date) => setDueDate(date)}
                required
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="documents" value="Upload Documents" />
              <FileInput
                id="documents"
                onChange={handleFileChange}
                multiple={true}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" // Add file type restrictions if needed
              />
            </div>
            <div>
              <Label htmlFor="assignedInspector" value="Assigned Inspector" />
              <Select
                id="assignedInspector"
                value={assignedInspector?.id || ""}
                onChange={(e) => handleAssignInspector(e.target.value)}
                required
              >
                <option value="">Select an inspector</option>
                {availableInspectors.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </Select>
              {assignedInspector && (
                <div className="flex items-center gap-2 mt-3">
                  <AvatarImage
                    customImage={
                      assignedInspector.picture?.url ||
                      assignedInspector.attributes?.picture.data?.attributes.url
                    }
                    customName={
                      assignedInspector.firstName ||
                      assignedInspector.attributes?.firstName
                    }
                  />
                  <span>{`${assignedInspector.firstName} ${assignedInspector.lastName}`}</span>
                  <Button
                    color="red"
                    onClick={handleRemoveInspector}
                    size="xs"
                    className="ml-2"
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="bg-dark-blue-700 text-white"
            onClick={handleSubmit}
            disabled={!isFormValid} // Disable button if form is not valid
          >
            Create Task
          </Button>
          <Button color="gray" onClick={() => setOpenModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
