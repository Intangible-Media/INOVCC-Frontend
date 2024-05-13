"use client";

// contexts/ClientContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { getClient } from "../utils/api/clients"; // Assuming this path is correct
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import qs from "qs";

const ClientContext = createContext();

export const useClient = () => useContext(ClientContext);

export const ClientProvider = ({ children }) => {
  console.log("this is working");
  const { data: session } = useSession();
  const [client, setClient] = useState(null); // State to store client data
  const pathname = usePathname();
  const clientId = pathname.split("/");

  const fetchClient = async () => {
    console.log("inside of if statement");
    if (!session || !clientId) return;

    console.log("passed section check");
    try {
      const query = qs.stringify({
        populate: {
          contacts: {
            populate: {
              picture: "*", // Populate the 'picture' relation
            },
            fields: [
              // Specify fields you want from 'contacts'
              "firstName",
              "lastName",
              "email",
              "phone",
              "jobTitle",
              "picture", // Include 'picture' in the fields if you want its ID
            ],
          },
          contracts: {
            populate: "*",
          },
          logo: {
            fields: ["url"],
          },
          invoices: {
            populate: "*",
          },
        },
      });

      const apiParams = {
        id: clientId[clientId.length - 1],
        jwt: session?.accessToken,
        query: query,
      };

      const clientData = await getClient(apiParams);

      console.log("This is the context client data:");
      console.log(clientData.data.data);
      setClient(clientData.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchClient();
  }, [session]);

  // Providing fetchClient through context so it can be invoked from components
  return (
    <ClientContext.Provider value={{ client, setClient }}>
      {children}
    </ClientContext.Provider>
  );
};
