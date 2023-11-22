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
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div class="flex items-center border-gray-300 rounded-lg dark:border-gray-600 h-32 md:h-32 bg-white p-8">
          <div className="w-full">
            <div className="flex items-end justify-between mt-1 mb-4">
              <div className="text-gray-600 text-sm uppercase">Revenue</div>
              <div className="text-sm text-green-500 font-semibold ml-2">
                +4.75%
              </div>
            </div>
            <div className="max-w-lg text-2xl font-semibold">$405,091.00</div>
          </div>
        </div>
        <div class="flex items-center rounded-lg border-gray-300 dark:border-gray-600 h-32 md:h-32 bg-white p-8">
          <div className="w-full">
            <div className="flex items-end justify-between mt-1 mb-4">
              <div className="text-gray-600 text-sm uppercase">Revenue</div>
              <div className="text-sm text-green-500 font-semibold ml-2">
                +4.75%
              </div>
            </div>
            <div className="max-w-lg text-2xl font-semibold">$405,091.00</div>
          </div>
        </div>
        <div class="flex items-center rounded-lg border-gray-300 dark:border-gray-600 h-32 md:h-32 bg-white p-8">
          <div className="w-full">
            <div className="flex items-end justify-between mt-1 mb-4">
              <div className="text-gray-600 text-sm uppercase">Revenue</div>
              <div className="text-sm text-green-500 font-semibold ml-2">
                +4.75%
              </div>
            </div>
            <div className="max-w-lg text-2xl font-semibold">$405,091.00</div>
          </div>
        </div>
        <div class="flex items-center rounded-lg border-gray-300 dark:border-gray-600 h-32 md:h-32 bg-white p-8">
          <div className="w-full">
            <div className="flex items-end justify-between mt-1 mb-4">
              <div className="text-gray-600 text-sm uppercase">Revenue</div>
              <div className="text-sm text-green-500 font-semibold ml-2">
                +4.75%
              </div>
            </div>
            <div className="max-w-lg text-2xl font-semibold">$405,091.00</div>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div class="border-gray-300 rounded-lg dark:border-gray-600 h-32 md:h-64 bg-white p-4"></div>
        <div class="rounded-lg border-gray-300 dark:border-gray-600 h-32 md:h-64 bg-white p-4"></div>
        <div class="rounded-lg border-gray-300 dark:border-gray-600 h-32 md:h-64 bg-white p-4"></div>
      </div>
      <div class="grid grid-cols-1 gap-4 mb-4 shadow-none">
        <div class="border-gray-300 rounded-lg dark:border-gray-600 bg-white p-0 shadow-none">
          <InspectionTable inspectionData={inspections} />
        </div>
      </div>
    </>
  );
}
