"use client";

import { TaskProvider, useTaskContext } from "../../context/TaskContext"; // Adjust the import path as needed
import { Modal, Badge, Button } from "flowbite-react";
import ImageCardGrid from "../../components/ImageCardGrid";
import ActivityLog from "../../components/ActivityLog";
import { formatDate, daysUntilDue } from "../../utils/strings"; // Adjust the import paths as needed

const UrgencyBadge = ({ urgency }) => {
  const urgencyMap = {
    low: { color: "success", text: "Low" },
    medium: { color: "warning", text: "Medium" },
    high: { color: "failure", text: "High" },
    default: { color: "failure", text: "Failure" },
  };

  const { color, text } =
    urgencyMap[urgency.toLowerCase()] || urgencyMap.default;

  return (
    <div className=" justify-start w-14">
      <Badge color={color} className="text-center inline-block" size="sm">
        {text}
      </Badge>
    </div>
  );
};

const TaskModal = () => {
  const { selectedTask, openModal, setOpenModal } = useTaskContext();

  return (
    <>
      {selectedTask && (
        <Modal show={openModal} onClose={() => setOpenModal(false)} size="7xl">
          <Modal.Header>Task Details</Modal.Header>
          <Modal.Body className="p-0">
            <section className="flex">
              <div className="w-full p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 capitalize">
                  {selectedTask.attributes.title}
                </h2>
                <div className="max-h-24 h-24 overflow-auto mb-5 border rounded-md p-3">
                  <p className="text-gray-600 dark:text-gray-300">
                    {selectedTask.attributes.description}
                  </p>
                </div>
                <div className="text-gray-600 dark:text-gray-300 flex justify-start">
                  Urgency:{" "}
                  <UrgencyBadge urgency={selectedTask.attributes.urgency} />
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Due Date: {`${formatDate(selectedTask.attributes.dueDate)}`}
                  <span className="font-normal text-gray-400 capitalize">
                    {`  (${daysUntilDue(selectedTask.attributes.dueDate)})`}
                  </span>
                </p>
                <div className="mt-8">
                  <ImageCardGrid
                    files={selectedTask.attributes.documents?.data || []}
                    background={"bg-white"}
                    editMode={false}
                    columns={3}
                    padded={false}
                  />
                </div>
              </div>
              <div className="w-full p-6 bg-gray-100">
                <ActivityLog
                  id={selectedTask.id}
                  collection="tasks"
                  defaultExpanded={true}
                />
              </div>
            </section>
          </Modal.Body>
          <Modal.Footer>
            {selectedTask.attributes.isComplete ? (
              <Button
                className="bg-red-800 text-white"
                onClick={() => markTaskAsIncomplete(selectedTask)}
              >
                Mark Incomplete
              </Button>
            ) : (
              <Button
                className="bg-dark-blue-700 text-white"
                onClick={() => markTaskAsComplete(selectedTask)}
              >
                Mark Complete
              </Button>
            )}
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default function Layout({ children }) {
  return (
    <TaskProvider>
      {children}
      <TaskModal />
    </TaskProvider>
  );
}
