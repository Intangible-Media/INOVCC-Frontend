"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button, TextInput, Dropdown, Avatar } from "flowbite-react";
import { getAllClients } from "../../utils/api/clients";
import Link from "next/link";
import qs from "qs";
import { ensureDomain } from "../../utils/strings";
import ClientDrawer from "../../components/Drawers/ClientDrawer";

export default function Page({ params }) {
  const { data: session, loading } = useSession();
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      if (!session) return;

      try {
        const query = qs.stringify({
          populate: {
            contacts: {
              fields: ["name", "email", "phone"],
            },
            logo: {
              fields: ["url"],
            },
          },
        });

        const apiParams = {
          jwt: session.accessToken,
          query: query,
        };

        const response = await getAllClients(apiParams);

        setClients(response.data.data);
        console.log(response.data.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchClients();
  }, [session]);

  const ElipseIcon = () => (
    <svg
      className="my-auto"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M9.99992 5.5C10.9204 5.5 11.6666 4.82843 11.6666 4C11.6666 3.17157 10.9204 2.5 9.99992 2.5C9.07944 2.5 8.33325 3.17157 8.33325 4C8.33325 4.82843 9.07944 5.5 9.99992 5.5Z"
        fill="#1F2A37"
      />
      <path
        d="M9.99992 11.5C10.9204 11.5 11.6666 10.8284 11.6666 10C11.6666 9.17157 10.9204 8.5 9.99992 8.5C9.07944 8.5 8.33325 9.17157 8.33325 10C8.33325 10.8284 9.07944 11.5 9.99992 11.5Z"
        fill="#1F2A37"
      />
      <path
        d="M9.99992 17.5C10.9204 17.5 11.6666 16.8284 11.6666 16C11.6666 15.1716 10.9204 14.5 9.99992 14.5C9.07944 14.5 8.33325 15.1716 8.33325 16C8.33325 16.8284 9.07944 17.5 9.99992 17.5Z"
        fill="#1F2A37"
      />
    </svg>
  );

  const ClientLogo = ({ client }) => {
    const abbreviatedName = client.attributes.name
      .split(" ")
      .filter(
        (n) =>
          !["and", "but", "for", "nor", "or", "so", "yet", "&"].includes(
            n.toLowerCase()
          )
      ) // Filter out coordinating conjunctions and "&"
      .map((n) => n[0].toUpperCase()) // Get the first letter of each word
      .join("")
      .slice(0, 2); // Only keep the first two characters
    return (
      <>
        {client.attributes.logo.data ? (
          <img
            src={ensureDomain(client.attributes.logo.data.attributes.url)}
            alt=""
            className="rounded-full w-10 h-10"
          />
        ) : (
          <Avatar placeholderInitials={abbreviatedName} rounded />
        )}
      </>
    );
  };

  const ClientCard = ({ client }) => {
    return (
      <div className="flex w-full justify-between bg-white p-6 rounded-md align-middle shadow">
        <div className="flex gap-4">
          <ClientLogo client={client} />
          <div className="flex flex-col align-middle justify-center gap-2">
            <p className="leading-none text-sm font-medium text-gray-900">
              {client.attributes.name}
            </p>
            <p className="leading-none text-xs text-gray-500">2 Contacts</p>
          </div>
        </div>
        <Dropdown
          inline
          label=""
          placement="top"
          dismissOnClick={false}
          renderTrigger={() => (
            <div className="flex">
              <ElipseIcon />
            </div>
          )}
        >
          <Dropdown.Item>
            <div className="flex items-center">
              <span>
                <Link href={`/clients/${client.id}`}>View</Link>
              </span>{" "}
            </div>
          </Dropdown.Item>
        </Dropdown>
      </div>
    );
  };

  return (
    <>
      <div className="flex justify-between py-6">
        <div className="flex flex-col gap-3">
          <h1 className="leading-tight text-2xl font-medium">
            Client Dashboard
          </h1>
          <h3 className="text-xs">
            Welcome to your client dashboard. Edit, view and create new clients
            here.
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3 align-middle">
          <ClientDrawer btnText={"Add Client"} />
        </div>
      </div>

      <div className="flex flex-col p-8 bg-white rounded-md gap-4">
        <TextInput className="bg-gray-50 w-full" />
        <div className="grid grid-cols-3 p-6 bg-gray-100 rounded-md gap-3 shadow-inner">
          {clients.map((client, index) => (
            <ClientCard client={client} key={index} />
          ))}
        </div>
      </div>
    </>
  );
}
