"use client";

import { Table } from "flowbite-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

export default function Page() {
  const { data: session, loading } = useSession();
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (session?.accessToken) {
        try {
          const response = await axios.get(
            `http://localhost:1337/api/clients`,
            {
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
              },
            }
          );

          console.log(response);
          setClients(response.data.data);
        } catch (error) {
          console.error("Error fetching data", error.response || error);
        }
      }
    };
    fetchData();
  }, [session]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-4">
      <div className="flex flex-col border-gray-300 dark:border-gray-600 bg-white gap-4 p-8 rounded-lg mb-4">
        <div className="overflow-x-auto">
          <Table striped hoverable>
            <Table.Head>
              <Table.HeadCell>Client Name</Table.HeadCell>
              <Table.HeadCell>Color</Table.HeadCell>
              <Table.HeadCell>Category</Table.HeadCell>
              <Table.HeadCell>Price</Table.HeadCell>
              <Table.HeadCell>
                <span className="sr-only">Edit</span>
              </Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {clients.map((client) => (
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {client.attributes.name}
                  </Table.Cell>
                  <Table.Cell>{client.attributes.name}</Table.Cell>
                  <Table.Cell>Laptop</Table.Cell>
                  <Table.Cell>$2999</Table.Cell>
                  <Table.Cell>
                    <a
                      href="#"
                      className="font-medium text-cyan-600 hover:underline dark:text-cyan-500"
                    >
                      Edit
                    </a>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </div>
    </div>
  );
}
