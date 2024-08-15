"use client";

import MapPanelalt from "./Panel/MapPanelalt";
import { useSelectedStructure } from "../context/SelectedStructureContext";

export default function MapPanelContainer() {
  const { selectedStructure, setSelectedStructure } = useSelectedStructure();
  console.log("selectedStructure", selectedStructure);
  return (
    <>
      {selectedStructure ? (
        <MapPanelalt
          structureId={selectedStructure.id}
          setSelectedStructure={setSelectedStructure}
        />
      ) : null}
    </>
  );
}
