"use client";

// contexts/InspectionContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { getInspection } from "../utils/api/inspections";
import { useSession } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";
import qs from "qs";

const InspectionContext = createContext();

export const useInspection = () => useContext(InspectionContext);

export const InspectionProvider = ({ children }) => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [inspection, setInspection] = useState(null);
  const inspectionId = pathname.split("/");

  const fetchInspection = async () => {
    if (!session) return;

    const query = qs.stringify(
      {
        populate: {
          structures: {
            populate: {
              inspectors: {
                populate: "*",
              },
              images: {
                populate: "*",
              },
              notes: {
                populate: "*",
              },
            },
          },
          client: {
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
            },
          },
          documents: {
            populate: "*",
          },
        },
      },
      {
        encodeValuesOnly: true, // This option is necessary to prevent qs from encoding the comma in the fields array
      }
    );

    const apiParams = {
      jwt: session?.accessToken,
      id: inspectionId[inspectionId.length - 1],
      query: query,
    };

    try {
      const response = await getInspection(apiParams);
      console.log({
        ...response.data.data.attributes,
        id: response.data.data.id,
      });

      setInspection({
        ...response.data.data.attributes,
        id: response.data.data.id,
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchInspection();
  }, [session]);

  return (
    <InspectionContext.Provider value={{ inspection, setInspection }}>
      {children}
    </InspectionContext.Provider>
  );
};
