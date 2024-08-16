"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Modal,
  TextInput,
  Textarea,
  Select,
  Label,
  Checkbox,
  Datepicker,
} from "flowbite-react";
import AvatarImage from "../AvatarImage";
import { getAllUsers } from "../../utils/api/users";
import { useSession } from "next-auth/react";
import { createTask } from "../../utils/api/tasks";
import { refreshTaskData } from "../../app/actions"; // Import revalidatePath

export default function NewTaskModal() {
  const { data: session } = useSession();
  const [openModal, setOpenModal] = useState(false);
  const [openInspectorsModal, setOpenInspectorsModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("low");
  const [dueDate, setDueDate] = useState(null);
  const [assignedInspector, setAssignedInspector] = useState(null);
  const [availableInspectors, setAvailableInspectors] = useState([]);
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

  const handleAssignInspector = (user) => {
    setAssignedInspector(user);
    setOpenInspectorsModal(false);
  };

  const handleRemoveInspector = () => {
    setAssignedInspector(null);
  };

  const handleSubmit = async (e) => {
    if (!session) return;
    e.preventDefault();

    // Assume your API call to create a task happens here and succeeds
    const payload = {
      data: {
        title,
        description,
        urgency,
        dueDate: dueDate ? dueDate : "",
        assignedInspector: assignedInspector ? assignedInspector.id : null,
      },
    };

    await createTask({
      jwt: session.accessToken,
      payload: payload,
      query: "",
    });

    // Revalidate the path after successfully creating the task
    refreshTaskData("/tasks"); // Replace '/tasks' with the correct path you want to revalidate

    setOpenModal(false);
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
                placeholderText="Select a due date"
                className="w-full"
              />
            </div>
            <div>
              <Label value="Assigned Inspector" className="mb-2" />
              {assignedInspector ? (
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
              ) : (
                <Button
                  color="light"
                  className="mt-3"
                  onClick={() => setOpenInspectorsModal(true)}
                >
                  Assign Inspector
                </Button>
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

      <Modal
        show={openInspectorsModal}
        onClose={() => setOpenInspectorsModal(false)}
      >
        <Modal.Header>Assign Inspector</Modal.Header>
        <Modal.Body className="max-h-[450px] overflow-scroll">
          {availableInspectors.map((user, index) => (
            <div
              key={`user-${index}`}
              className="flex justify-between p-4 pl-0 gap-4 w-full border-b border-gray-300 cursor-pointer"
              onClick={() => handleAssignInspector(user)}
            >
              <div className="flex justify-center gap-3">
                <AvatarImage
                  customImage={
                    user.picture?.url ||
                    user.attributes?.picture.data?.attributes.url
                  }
                  customName={user.firstName || user.attributes?.firstName}
                />
                <h3 className="text-base leading-none font-medium shorten-text m-auto">
                  {`${user.firstName} ${user.lastName}` || ""}
                  <span className="text-base leading-none font-light text-gray-400 shrink-0">
                    {" "}
                    / {user.role?.name || ""}
                  </span>
                </h3>
              </div>
              <Checkbox
                className="my-auto"
                checked={assignedInspector?.id === user.id}
              />
            </div>
          ))}
        </Modal.Body>
      </Modal>
    </>
  );
}
