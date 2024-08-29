// contexts/ConfirmationContext.js
import React, { createContext, useState, useContext } from "react";
import { Modal, Button } from "flowbite-react";

const ConfirmationContext = createContext();

export const ConfirmationProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [onConfirm, setOnConfirm] = useState(null);

  const requestConfirmation = (message, onConfirmAction) => {
    setConfirmationMessage(message);
    setOnConfirm(() => () => {
      onConfirmAction();
      setIsOpen(false);
    });
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <ConfirmationContext.Provider value={{ requestConfirmation }}>
      {children}
      <Modal show={isOpen} onClose={handleClose}>
        <Modal.Header>Are you sure?</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
              {confirmationMessage}
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="failure" onClick={onConfirm}>
            Yes
          </Button>
          <Button color="gray" onClick={handleClose}>
            No
          </Button>
        </Modal.Footer>
      </Modal>
    </ConfirmationContext.Provider>
  );
};

export const useConfirmation = () => useContext(ConfirmationContext);
