"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card } from "flowbite-react";
import Image from "next/image";
import InspectionTable from "../components/InspectionTable";
import qs from "qs";

export default function Home() {
  const [inspections, setInspections] = useState([]);
  const { data: session } = useSession();

  const query = qs.stringify({
    populate: {
      structures: {
        populate: {
          inspectors: {
            fields: ["username"],
          },
        },
      },
      client: {
        populate: {
          fields: ["name"],
        },
      },
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (session?.accessToken) {
        try {
          const response = await axios.get(
            `http://localhost:1337/api/inspections?${query}`,
            {
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
              },
            }
          );
          console.log(response.data.data);
          setInspections(response.data.data);
        } catch (error) {
          console.error("Error fetching data", error.response || error);
        }
      }
    };

    fetchData();
  }, [session]);

  return (
    <>
      <InspectionTable inspectionData={inspections} />
    </>
  );
}
