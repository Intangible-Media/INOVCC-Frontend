"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Badge,
  Checkbox,
  Dropdown,
  Label,
  Table,
  TextInput,
  Spinner,
  Textarea,
} from "flowbite-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSession } from "next-auth/react";
import qs from "qs";
import ActivityLog from "../../../components/ActivityLog";
import ImageCardGrid from "../../../components/ImageCardGrid";
import DirectionsComponent from "../../../components/DirectionsComponent";
import AvatarImage from "../../../components/AvatarImage";
import {
  CheckMark,
  FavoriteIcon,
  PlusIcon,
} from "../../../public/icons/intangible-icons";
import { getAllTasks, createTask, uploadFiles } from "../../../utils/api/tasks";
import { createActivity } from "../../../utils/api/activities";
import { getAllUsers } from "../../../utils/api/users";
import { EditIcon } from "../../../public/icons/intangible-icons";
import { getAllStructure } from "../../../utils/api/structures";
import { useRouter } from "next/navigation";
import {
  formatReadableDate,
  formatAbbreviatedDate,
} from "../../../utils/strings";
import MapPanelSchedule from "../../../components/Panel/MapPanelSchedule";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });
const MapboxMap = dynamic(() => import("../../../components/MapBox"), {
  ssr: false,
});

export default function Page({ params }) {
  console.log(params.team);
  const { data: session } = useSession();
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [structures, setStructures] = useState([]);
  const [zoom, setZoom] = useState(20);
  const [myTasks, setMyTasks] = useState([]);
  const [activeCoordinate, setActiveCoordinate] = useState([78.0421, 27.1751]);
  const [selectedStructure, setSelectedStructure] = useState(null);

  const coordinates = structures.map((structure) => [
    structure.attributes.longitude,
    structure.attributes.latitude,
  ]);

  const iconMap = {
    red: "/location-red.png",
    yellow: "/location-yellow.png",
    drkgreen: "/location-dark.png",
    green: "/location-green.png",
  };

  const loadIcon = (color) => iconMap[color] || "/location-red.png";

  const unSelectStructure = () => {
    setSelectedStructure(null);
  };

  const getColorBasedOnStatus = (status) => {
    switch (status.toLowerCase()) {
      case "uploaded":
        return "drkgreen";
      case "inspected":
        return "green";
      case "not inspected":
        return "yellow";
      default:
        return "red";
    }
  };

  const getInspectionColor = (status) => {
    switch (status.toLowerCase()) {
      case "uploaded":
        return "text-white bg-green-800";
      case "inspected":
        return "text-green-800 bg-green-100";
      case "not inspected":
        return "text-yellow-800 bg-yellow-100";
      default:
        return "text-red-800 bg-red-100";
    }
  };

  useEffect(() => {
    const taskQuery = qs.stringify({
      populate: {
        documents: { populate: "*" },
        assigned: { populate: "*" },
      },
    });

    const structureQuery = qs.stringify(
      {
        populate: {
          inspection: {
            fields: ["name"],
          },
          images: {
            populate: "*",
          },
          documents: {
            populate: "*",
          },
          assigned: {
            populate: "*",
          },
          inspectors: {
            populate: "*",
          },
        },
      },
      {
        encodeValuesOnly: true, // This option is necessary to prevent qs from encoding the comma in the fields array
      }
    );

    const fetchTasks = async () => {
      if (!session) return;
      const response = await getAllTasks({
        jwt: session?.accessToken,
        query: taskQuery,
      });
      setTasks(response.data.data);
    };

    const fetchStructure = async () => {
      if (!session) return;
      const response = await getAllStructure({
        jwt: session?.accessToken,
        query: structureQuery,
      });
      setStructures(response.data.data);
      console.log(response.data.data);
      if (response.data.data.length > 0) {
        setActiveCoordinate([
          response.data.data[0].attributes.longitude,
          response.data.data[0].attributes.latitude,
        ]);
      }
    };

    fetchTasks();
    fetchStructure();
  }, [session]);

  useEffect(() => {
    if (session) {
      setMyTasks(
        tasks.filter(
          (task) => task.attributes.assigned.data.id === session.user.id
        )
      );
    }
  }, [tasks, session]);

  const TeamCard = () => (
    <div className="flex w-full justify-between bg-white p-6 rounded-md align-middle shadow">
      <div className="flex gap-4">
        <AvatarImage />
        <div className="flex flex-col align-middle justify-center gap-2">
          <p className="leading-none text-sm font-medium text-gray-900">
            {params.team}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex gap-4 flex-col justify-between py-6">
      <section className="grid grid-cols-2 p-0 bg-white rounded-md gap-0 h-[600px] overflow-hidden shadow-md">
        <div className="flex flex-col justify-between p-8 gap-6 h-[600px]">
          <div>
            <h1 className="leading-tight text-2xl font-medium">
              {params.team}
            </h1>
            <h3 className="text-xs">
              Welcome to your task dashboard. Edit, view and create new tasks
              here.
            </h3>
          </div>
          <div className="bg-white p-0 rounded-lg">
            <div className="grid grid-cols-3 gap-3 w-full">
              <div className="flex bg-yellow-50 gap-4 rounded-lg p-6">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <p className="text-2xl text-yellow-800">12</p>
                </div>
                <p className="self-center text-sm text-center text-yellow-800 font-semibold mt-2">
                  Urgent Tasks
                </p>
              </div>
              <div className="flex bg-red-50 gap-4 rounded-lg p-6">
                <div className="bg-red-100 p-3 rounded-full">
                  <p className="text-2xl text-red-800">18</p>
                </div>
                <p className="self-center text-sm text-center text-red-800 font-semibold mt-2">
                  Not Opened
                </p>
              </div>
              <div className="flex bg-green-50 gap-4 rounded-lg p-6">
                <div className="bg-green-100 p-3 rounded-full">
                  <p className="text-2xl text-green-600">3</p>
                </div>
                <p className="self-center text-sm text-center text-green-600 font-semibold mt-2">
                  Late Tasks
                </p>
              </div>
            </div>
          </div>
          <div className="im-snapping overflow-scroll w-full h-full">
            {structures.map((structure, index) => (
              <div
                key={`${structure.id}-${index}`}
                className="flex flex-row cursor-pointer justify-between items-center bg-white border-0 border-b-2 border-gray-100 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 p-4 mb-0 w-full"
                onClick={() => {
                  setSelectedStructure(structure);
                  router.push(
                    `/inspections/${structure.attributes.inspection.data.id}?structure=${structure.id}`
                  );
                }}
              >
                <div className="flex">
                  <img
                    src={loadIcon(
                      getColorBasedOnStatus(structure.attributes.status)
                    )}
                    style={{ height: 27 }}
                  />
                  <div className="flex flex-col justify-between pt-0 pb-0 pl-4 pr-4 leading-normal">
                    <h5 className="flex flex-shrink-0 mb-1 text-sm font-bold tracking-tight text-gray-900 dark:text-white">
                      {structure.attributes.mapSection}
                      <span className="flex items-center font-light ml-1">
                        {` / ${structure.attributes.type}`}
                      </span>
                    </h5>
                    <DirectionsComponent />
                  </div>
                </div>
                <div className="flex gap-3">
                  <p className="flex text-sm text-gray-700 dark:text-gray-400">
                    <span
                      className={`${getInspectionColor(
                        structure.attributes.status
                      )} flex align-middle text-xs font-medium me-2 px-2.5 py-0.5 gap-2 rounded-full`}
                    >
                      {structure.attributes.status}
                      {structure.attributes.status === "Uploaded" && (
                        <CheckMark />
                      )}
                    </span>
                  </p>

                  {/* <EditIcon /> */}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative border-white border-2 dark:border-gray-600 bg-white rounded-lg h-full">
          <MapboxMap
            lng={
              selectedStructure?.attributes.longitude ||
              activeCoordinate[0] ||
              78.0421
            }
            lat={
              selectedStructure?.attributes.latitude ||
              activeCoordinate[1] ||
              27.1751
            }
            zoom={16}
            style="mapbox://styles/mapbox/standard-beta"
            coordinates={coordinates}
          />
        </div>
      </section>
    </div>
  );
}
