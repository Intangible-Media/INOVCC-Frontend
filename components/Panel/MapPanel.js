import ImageCardSlider from "../ImageCardSlider";
import { Label } from "flowbite-react";
import { useEffect, useState } from "react";
import { Dropdown, TextInput, Avatar, Button, Popover } from "flowbite-react";
import { ensureDomain } from "../../utils/strings";
import { getAllUsers } from "../../utils/api/users";
import { useSession } from "next-auth/react";
import qs from "qs";

export default function MapPanel({ structure }) {
  const [currentPanel, setCurrentPanel] = useState("overview");

  const activePanelClasses = (panelTab) => {
    if (panelTab === currentPanel)
      return "border-b-2 border-dark-blue-700 text-dark-blue-700";
  };

  const getInspectionColor = (status) => {
    if (status.toLowerCase() == "uploaded") return "text-white bg-green-800";
    if (status.toLowerCase() == "inspected")
      return "text-green-800 bg-green-100";
    if (status.toLowerCase() == "not inspected")
      return "text-yellow-800 bg-yellow-100";
    else return "text-red-800 bg-red-100";
  };

  return (
    <>
      <div className="flex justify-between px-8 pt-5 pb-2 w-full">
        <div className="flex flex-col gap-2">
          <h4 className="leading-none text-xs font-medium text-gray-500">
            Map Name 12344.89
          </h4>
          <h3 className="text-base leading-none font-medium">
            Structure Name 1 <span className="text-gray-500"> / Man Hole</span>
          </h3>
        </div>
        <span
          className={`${getInspectionColor(
            structure.attributes.status
          )} flex self-center align-middle text-xs font-medium px-2.5 py-0.5 gap-2 rounded-full`}
        >
          {structure.attributes.status}
          {structure.attributes.status === "Uploaded" && (
            <svg
              className="m-auto"
              xmlns="http://www.w3.org/2000/svg"
              width="10"
              height="7"
              viewBox="0 0 10 7"
              fill="none"
            >
              <path
                d="M3.6722 6.99999C3.51987 7.00065 3.37336 6.93626 3.26399 6.82059L0.509147 3.90423C0.454238 3.84574 0.410425 3.77604 0.38021 3.69908C0.349996 3.62212 0.33397 3.53943 0.33305 3.45572C0.331191 3.28665 0.390968 3.12371 0.499233 3.00273C0.607497 2.88175 0.755379 2.81264 0.910347 2.81061C1.06532 2.80858 1.21467 2.8738 1.32557 2.99191L3.67453 5.47756L8.67336 0.181164C8.78441 0.0630521 8.93392 -0.00209614 9.089 5.14605e-05C9.24407 0.00219906 9.39202 0.0714667 9.50028 0.192616C9.60855 0.313765 9.66826 0.476873 9.6663 0.646056C9.66433 0.815239 9.60083 0.976641 9.48979 1.09475L4.08041 6.82059C3.97104 6.93626 3.82452 7.00065 3.6722 6.99999Z"
                fill="white"
              />
            </svg>
          )}
        </span>
      </div>
      <div className="im-tabs-header flex gap-3 border-b w-full px-8 justify-between">
        <div
          className={`im-tab px-4 py-3 cursor-pointer text-gray-500 ${activePanelClasses(
            "overview"
          )}`}
          onClick={(e) => setCurrentPanel("overview")}
        >
          <h3 className="text-xs font-medium">Overview</h3>
        </div>
        <div
          className={`im-tab px-4 py-3 cursor-pointer text-gray-500 ${activePanelClasses(
            "assets"
          )}`}
          onClick={(e) => setCurrentPanel("assets")}
        >
          <h3 className="text-xs font-medium">Assets</h3>
        </div>
        <div
          className={`im-tab px-4 py-3 cursor-pointer text-gray-500 ${activePanelClasses(
            "notes"
          )}`}
          onClick={(e) => setCurrentPanel("notes")}
        >
          <h3 className="text-xs font-medium">Notes</h3>
        </div>
        <div
          className={`im-tab px-4 py-3 cursor-pointer text-gray-500 ${activePanelClasses(
            "edit"
          )}`}
          onClick={(e) => setCurrentPanel("edit")}
        >
          <h3 className="text-xs font-medium">Edit</h3>
        </div>
      </div>
      {structure && (
        <div className="overflow-auto w-full">
          {currentPanel === "overview" && (
            <div id="overview-content">
              <div className="flex gap-4 border-b px-8 py-4">
                <ul className="space-y-3 text-left text-gray-500 dark:text-gray-400">
                  <li className="flex items-center space-x-3 rtl:space-x-reverse">
                    <svg
                      className="m-auto"
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M7.99967 7.64904C7.36069 7.64904 6.73605 7.46384 6.20476 7.11684C5.67346 6.76985 5.25936 6.27665 5.01483 5.69962C4.7703 5.12259 4.70632 4.48764 4.83098 3.87507C4.95564 3.2625 5.26334 2.69982 5.71518 2.25818C6.16701 1.81654 6.74267 1.51578 7.36938 1.39393C7.99609 1.27208 8.64569 1.33462 9.23604 1.57363C9.82638 1.81265 10.331 2.2174 10.686 2.73672C11.041 3.25603 11.2304 3.86658 11.2304 4.49115C11.2295 5.32839 10.8888 6.13107 10.2831 6.72309C9.67744 7.31511 8.85624 7.64811 7.99967 7.64904ZM7.99967 2.73676C7.64468 2.73676 7.29766 2.83966 7.0025 3.03243C6.70733 3.2252 6.47728 3.4992 6.34143 3.81977C6.20558 4.14035 6.17004 4.49309 6.23929 4.83341C6.30855 5.17373 6.47949 5.48633 6.73051 5.73169C6.98153 5.97704 7.30134 6.14413 7.64951 6.21182C7.99768 6.27952 8.35857 6.24477 8.68654 6.11199C9.01451 5.9792 9.29483 5.75434 9.49206 5.46583C9.68928 5.17733 9.79455 4.83813 9.79455 4.49115C9.79455 4.02586 9.60544 3.57962 9.26884 3.25061C8.93224 2.9216 8.4757 2.73676 7.99967 2.73676Z"
                        fill="#312E8E"
                      />
                      <path
                        d="M11.9484 14.6666H4.05096C3.86054 14.6666 3.67793 14.5927 3.54329 14.461C3.40865 14.3294 3.33301 14.1509 3.33301 13.9648V11.8596C3.33415 10.9293 3.71272 10.0375 4.38568 9.37972C5.05864 8.72194 5.97104 8.35191 6.92275 8.3508H9.0766C10.0283 8.35191 10.9407 8.72194 11.6137 9.37972C12.2866 10.0375 12.6652 10.9293 12.6663 11.8596V13.9648C12.6663 14.1509 12.5907 14.3294 12.4561 14.461C12.3214 14.5927 12.1388 14.6666 11.9484 14.6666ZM4.76891 13.2631H11.2304V11.8596C11.2304 11.3012 11.0035 10.7657 10.5996 10.3709C10.1957 9.97611 9.64783 9.7543 9.0766 9.7543H6.92275C6.35152 9.7543 5.80368 9.97611 5.39975 10.3709C4.99583 10.7657 4.76891 11.3012 4.76891 11.8596V13.2631Z"
                        fill="#312E8E"
                      />
                    </svg>
                    <span className="leading-none font-medium text-xs text-gray-900">
                      Individual configuration
                    </span>
                  </li>
                  <li className="flex items-center space-x-3 rtl:space-x-reverse">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M8.00032 1.33325C6.5863 1.3347 5.23062 1.87712 4.23076 2.84148C3.23089 3.80584 2.66851 5.11338 2.667 6.47719C2.66485 7.57743 3.03235 8.64874 3.71447 9.53063C3.72736 9.55225 3.74161 9.57309 3.75713 9.59304L7.43143 14.3886C7.49756 14.4748 7.58373 14.5449 7.68302 14.5931C7.78231 14.6414 7.89196 14.6666 8.00317 14.6666C8.11437 14.6666 8.22402 14.6414 8.32331 14.5931C8.4226 14.5449 8.50877 14.4748 8.5749 14.3886L12.2464 9.59304C12.2619 9.57333 12.2761 9.55271 12.289 9.53131C12.9701 8.64883 13.3366 7.57733 13.3336 6.47719C13.3321 5.11338 12.7697 3.80584 11.7699 2.84148C10.77 1.87712 9.41434 1.3347 8.00032 1.33325ZM11.1015 8.76795C11.0819 8.79283 11.0641 8.81896 11.0481 8.84614L8.00032 12.8241L4.95322 8.84614C4.93678 8.81887 4.91874 8.79254 4.89917 8.76727C4.37311 8.11178 4.08816 7.3061 4.08922 6.47719C4.08922 5.47673 4.50128 4.51725 5.23475 3.80983C5.96823 3.1024 6.96303 2.70497 8.00032 2.70497C9.03761 2.70497 10.0324 3.1024 10.7659 3.80983C11.4994 4.51725 11.9114 5.47673 11.9114 6.47719C11.9126 7.30633 11.6277 8.11228 11.1015 8.76795Z"
                        fill="#312E8E"
                      />
                      <path
                        d="M8.00032 3.81743C7.43774 3.81743 6.8878 3.97833 6.42004 4.27978C5.95227 4.58123 5.58769 5.0097 5.3724 5.511C5.15711 6.01229 5.10079 6.5639 5.21054 7.09608C5.32029 7.62825 5.5912 8.11708 5.989 8.50076C6.3868 8.88444 6.89363 9.14572 7.4454 9.25158C7.99717 9.35744 8.56909 9.30311 9.08884 9.09546C9.60859 8.88782 10.0528 8.53619 10.3654 8.08503C10.6779 7.63388 10.8448 7.10346 10.8448 6.56086C10.8438 5.83354 10.5438 5.13626 10.0106 4.62196C9.47737 4.10767 8.75442 3.81834 8.00032 3.81743ZM8.00032 7.93258C7.71903 7.93258 7.44406 7.85213 7.21018 7.7014C6.9763 7.55068 6.79401 7.33644 6.68636 7.08579C6.57872 6.83515 6.55055 6.55934 6.60543 6.29325C6.66031 6.02717 6.79576 5.78275 6.99466 5.59091C7.19356 5.39907 7.44698 5.26843 7.72286 5.2155C7.99874 5.16257 8.2847 5.18974 8.54458 5.29356C8.80446 5.39738 9.02658 5.5732 9.18285 5.79878C9.33913 6.02435 9.42254 6.28956 9.42254 6.56086C9.42254 6.92466 9.2727 7.27356 9.00598 7.53081C8.73926 7.78806 8.37752 7.93258 8.00032 7.93258Z"
                        fill="#312E8E"
                      />
                    </svg>
                    <span className="leading-none font-medium text-xs text-gray-900">
                      No setup, or hidden fees
                    </span>
                  </li>
                  <li className="flex items-center space-x-3 rtl:space-x-reverse">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M9.95048 14C9.5977 13.9986 9.24613 13.9588 8.90198 13.8814C7.28895 13.4264 5.83725 12.5256 4.71398 11.2825C3.46963 10.16 2.56792 8.70894 2.11274 7.09662C1.93169 6.29202 1.96924 5.45367 2.2215 4.66845C2.47376 3.88323 2.93154 3.17971 3.54743 2.63079C3.73542 2.4247 3.9658 2.26169 4.22277 2.15297C4.47974 2.04424 4.75721 1.99237 5.03614 2.00091C5.54089 2.0375 6.01344 2.26232 6.3601 2.63079L7.29388 3.56395C7.66619 3.93704 7.87526 4.44245 7.87526 4.96935C7.87526 5.49626 7.66619 6.00166 7.29388 6.37476L6.82699 6.84134C6.70443 6.96427 6.63562 7.13072 6.63562 7.30425C6.63562 7.47778 6.70443 7.64423 6.82699 7.76716L8.22766 9.1669C8.35087 9.28926 8.51751 9.35793 8.69121 9.35793C8.86491 9.35793 9.03155 9.28926 9.15476 9.1669L9.62165 8.70032C9.99502 8.32806 10.5009 8.11899 11.0283 8.11899C11.5557 8.11899 12.0616 8.32806 12.435 8.70032L13.3688 9.63348C13.7374 9.97966 13.9624 10.4517 13.9991 10.9559C14.0077 11.2348 13.9559 11.5122 13.8471 11.7691C13.7383 12.026 13.5751 12.2564 13.3688 12.4443C12.9342 12.9215 12.4071 13.3055 11.8195 13.5729C11.2319 13.8404 10.596 13.9857 9.95048 14ZM4.94809 3.33532C4.769 3.35182 4.60374 3.43859 4.48854 3.57661C4.03483 3.9691 3.69575 4.47688 3.50718 5.04619C3.31861 5.61551 3.28758 6.22518 3.41736 6.81068C3.82109 8.17376 4.59745 9.39721 5.6591 10.3433C6.60584 11.4043 7.83011 12.1802 9.19412 12.5836C9.78049 12.7127 10.3909 12.6812 10.9608 12.4925C11.5308 12.3037 12.0392 11.9647 12.4323 11.5111C12.5035 11.4526 12.5617 11.3798 12.6031 11.2975C12.6446 11.2153 12.6684 11.1252 12.6731 11.0332C12.6493 10.8599 12.5638 10.7009 12.4323 10.5853L11.4985 9.65214C11.3753 9.52979 11.2087 9.46112 11.035 9.46112C10.8613 9.46112 10.6947 9.52979 10.5714 9.65214L10.1046 10.1187C9.73101 10.4907 9.22519 10.6995 8.69788 10.6995C8.17057 10.6995 7.66475 10.4907 7.29121 10.1187L5.89054 8.71899C5.51835 8.34569 5.30937 7.84021 5.30937 7.31325C5.30937 6.78629 5.51835 6.2808 5.89054 5.90751L6.35743 5.44093C6.47995 5.31811 6.54874 5.15177 6.54874 4.97835C6.54874 4.80493 6.47995 4.63859 6.35743 4.51577L5.42365 3.58261C5.30786 3.4513 5.14887 3.36571 4.97544 3.34132L4.94809 3.33532Z"
                        fill="#312E8E"
                      />
                    </svg>
                    <span className="leading-none font-medium text-xs text-gray-900">
                      No setup, or hidden fees
                    </span>
                  </li>
                  <li className="flex items-center space-x-3 rtl:space-x-reverse">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M13.333 2.66675H2.66634C2.31272 2.66675 1.97358 2.81659 1.72353 3.08331C1.47348 3.35003 1.33301 3.71177 1.33301 4.08897V11.9112C1.33301 12.2884 1.47348 12.6501 1.72353 12.9169C1.97358 13.1836 2.31272 13.3334 2.66634 13.3334H13.333C13.6866 13.3334 14.0258 13.1836 14.2758 12.9169C14.5259 12.6501 14.6663 12.2884 14.6663 11.9112V4.08897C14.6663 3.71177 14.5259 3.35003 14.2758 3.08331C14.0258 2.81659 13.6866 2.66675 13.333 2.66675ZM12.9683 4.08897L8.02834 8.55759L3.03701 4.08897H12.9683ZM2.66634 11.9112V5.6143L7.19967 9.66764C7.42777 9.85063 7.7056 9.94925 7.99101 9.94853C8.29398 9.94725 8.58826 9.84037 8.82901 9.64417L13.333 5.6143V11.9112H2.66634Z"
                        fill="#312E8E"
                      />
                    </svg>
                    <span className="leading-none font-medium text-xs text-gray-900">
                      No setup, or hidden fees
                    </span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col border-b px-8 py-6">
                <h4 className="leading-none font-medium text-sm mb-4">
                  Assets
                </h4>
                <ImageCardSlider images={structure.attributes.images} />
              </div>
              <div className="flex flex-col border-b px-8 py-6">
                <h4 className="leading-none font-medium text-sm mb-4">
                  Inspectors
                </h4>
                <AddInspectorForm
                  currentInspectors={structure.attributes.inspectors.data}
                  addForm={false}
                />
              </div>
              <div className="flex flex-col blorder-b px-8 py-6 bg-gray-50">
                <h4 className="leading-none font-medium text-sm mb-2">Notes</h4>
                <StructureNotes notes={structure.attributes.notes} />
              </div>
            </div>
          )}

          {currentPanel === "assets" && (
            <div id="assets-content" className="w-full">
              <div className="flex flex-col px-8 py-6">
                <h4 className="leading-none font-medium text-sm mb-4">
                  Assets
                </h4>
                <ImageCardSlider
                  images={structure.attributes.images}
                  structureId={structure.id}
                  limit={false}
                />
              </div>
            </div>
          )}

          {currentPanel === "notes" && (
            <div id="inspectors-content" className="w-full bg-gray-50">
              <div className="flex flex-col px-8 pt-6 mb-2">
                <h4 className="leading-none font-medium text-sm mb-2">Notes</h4>
              </div>
              <div className="flex flex-col px-8 pb-6">
                <StructureNotes notes={structure.attributes.notes} />
              </div>
            </div>
          )}

          {currentPanel === "edit" && (
            <div id="notes-content" className="w-full">
              <div className="flex flex-col px-8 pt-6 pb-8">
                <h4 className="leading-none font-medium text-sm mb-6">Edit</h4>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col">
                    <label className="text-xs" htmlFor="structureName">
                      Map Section
                    </label>
                    <input
                      className="border-b-2 border-x-0 border-t-0 border-b-gray-200 pl-0"
                      type="text"
                      id="structureName"
                      placeholder="Enter Structure Name"
                      value={structure.attributes?.mapSection}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs" htmlFor="structureType">
                      Structure Type
                    </Label>
                    <select
                      id="structureType"
                      className="pl-0 border-x-0 border-t-0 border-b-2 border-b-gray-200"
                    >
                      <option value="Standard Vault">Standard Vault</option>
                      <option value="Pull Box">Pull Box</option>
                      <option value="Wood Pole">Wood Pole</option>
                      <option value="Man Hole">Man Hole</option>
                      <option value="Street Light">Street Light</option>
                      <option value="Pad Vault">Pad Vault</option>
                      <option value="Beehive">Beehive</option>
                    </select>
                  </div>
                  <div className="flex flex-col w-full">
                    <label className="text-xs" htmlFor="structureLongitude">
                      Longitude
                    </label>
                    <input
                      className="border-b-2 border-x-0 border-t-0 border-b-gray-200 pl-0"
                      type="text"
                      id="structureLongitude"
                      placeholder="Enter Longitude"
                      value={structure.attributes?.longitude}
                    />
                  </div>
                  <div className="flex flex-col w-full">
                    <label className="text-xs" htmlFor="structureLatitude">
                      Latitude
                    </label>
                    <input
                      className="border-b-2 border-x-0 border-t-0 border-b-gray-200 pl-0"
                      type="text"
                      id="structureLatitude"
                      placeholder="Enter Latitude"
                      value={structure.attributes?.latitude}
                    />
                  </div>
                  <div className="flex flex-col w-full">
                    <AddInspectorForm
                      currentInspectors={structure.attributes.inspectors.data}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="bg-dark-blue-700 text-white mt-5">
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

const StructureNotes = ({ notes = [] }) => {
  return (
    <ul className="flex flex-col gap-4">
      {notes.map((note, index) => (
        <li key={index} className="bg-white rounded-md border">
          <div className="p-3">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="flex-shrink-0">
                <img
                  className="w-8 h-8 rounded-full"
                  src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                  alt="Neil image"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                  {note?.author?.data?.attributes?.firstName}{" "}
                  {note?.author?.data?.attributes?.lastName}
                </p>
              </div>
            </div>
            <div className="mt-2">
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                {note.text}
              </p>
            </div>
          </div>
          <div className="py-2 px-3 text-right border-t">
            <a href="#">Reply</a>
          </div>
        </li>
      ))}
    </ul>
  );
};

const AddInspectorForm = ({ currentInspectors, addForm = true }) => {
  const { data: session } = useSession();
  const [availableInspectors, setAvailableInspectors] = useState([]);
  const [assignedInspectors, setAssignedInspectors] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // Mock function to simulate fetching users
  // Replace this with your actual getAllUsers function
  const fetchUsers = async () => {
    const query = qs.stringify(
      {
        populate: "*",
      },
      {
        encodeValuesOnly: true, // This option is necessary to prevent qs from encoding the comma in the fields array
      }
    );

    const apiParams = {
      jwt: session?.accessToken,
      query: query,
    };

    try {
      const response = await getAllUsers(apiParams);

      const filteredUsers = response.data.filter((user) => {
        return !currentInspectors.some((inspector) => inspector.id === user.id);
      });

      setAvailableInspectors(filteredUsers);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    setAssignedInspectors([...currentInspectors]);
  }, []);

  return (
    <>
      {addForm ? (
        <>
          <div className="flex flex-col force-w-full border-b-2 text-gray-700 hover:border-x-0 hover:border-t-0">
            <label className="text-xs">Add Inspectors</label>
            <Dropdown
              label="Add Inspectors"
              className="force-w-full bg-white border-none hover:border-none hover:outline-none"
            >
              {availableInspectors.map((user) => (
                <Dropdown.Item
                  key={user.id}
                  onClick={() => {
                    setAssignedInspectors([...assignedInspectors, user]);
                    setAvailableInspectors(
                      availableInspectors.filter(
                        (inspector) => inspector.id !== user.id
                      )
                    );
                  }}
                  className="w-full"
                >
                  {user.username || user.attributes.username}
                </Dropdown.Item>
              ))}
            </Dropdown>
          </div>

          <div className="flex gap-1 items-center mt-4 -space-x-4 rtl:space-x-reverse">
            {assignedInspectors.map((inspector, index) => {
              const inspectorImage =
                inspector.attributes?.picture.data.attributes.formats.thumbnail
                  .url || inspector.picture.formats.thumbnail.url;
              return (
                <div key={index} className="relative group">
                  <button
                    className="bg-red-600 hover:bg-red-800 text-white p-1 text-xxs rounded-full absolute top-0 right-0 z-30 opacity-0 group-hover:opacity-100"
                    onClick={() => {
                      setAssignedInspectors(
                        assignedInspectors.filter(
                          (user) => inspector.id !== user.id
                        )
                      );
                      setAvailableInspectors([
                        ...availableInspectors,
                        inspector,
                      ]);
                    }}
                  >
                    <img
                      src="/icons/x-icon.png"
                      alt=""
                      srcset=""
                      className="w-1.5 h-1.5"
                    />
                  </button>
                  <img
                    className="inline-block w-12 h-12 rounded-full ring-2 ring-white bg-cover object-cover"
                    src={ensureDomain(inspectorImage)}
                    alt=""
                  />
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className="flex -space-x-4 rtl:space-x-reverse">
            {assignedInspectors.map((inspector, index) => {
              const inspectorImage =
                inspector.attributes?.picture.data.attributes.formats.thumbnail
                  .url || inspector.picture.formats.thumbnail.url;
              return (
                <img
                  key={index}
                  className="inline-block w-12 h-12 rounded-full ring-2 ring-white bg-cover object-cover"
                  src={ensureDomain(inspectorImage)}
                  alt=""
                />
              );
            })}
          </div>
          <div className="flex justify-end">
            <a
              href="#"
              className="leading-none text-xs font-medium text-dark-blue-700"
            >
              Email Team
            </a>
          </div>
        </>
      )}
    </>
  );
};
