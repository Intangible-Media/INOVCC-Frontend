"use client";

import { Table, Button } from "flowbite-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import axios from "axios";
import qs from "qs";

export default function Page() {
  const { data: session, loading } = useSession();
  const [invoices, setInvoices] = useState([]);

  const query = qs.stringify({
    populate: ["client", "structures"], // Populate the inspection and its client
    encodeValuesOnly: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (session?.accessToken) {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/invoices?${query}`,
            {
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
              },
            }
          );

          console.log(response);
          setInvoices(response.data.data);
        } catch (error) {
          console.error("Error fetching data", error.response || error);
        }
      }
    };
    fetchData();
  }, [session]);

  return (
    <>
      <div className="flex my-6">
        <Link href="/billing/create" className="w-full">
          <Button className="bg-dark-blue-700 text-white w-full">
            New Invoice
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-4 mb-4">
        <div className="flex flex-col border-gray-300 dark:border-gray-600 bg-white gap-4 h-60 rounded-lg"></div>
        <div className="flex flex-col border-gray-300 dark:border-gray-600 bg-white gap-4 h-60 rounded-lg"></div>
        <div className="flex flex-col border-gray-300 dark:border-gray-600 bg-white gap-4 h-60 rounded-lg"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-4">
        <div className="flex flex-col border-gray-300 dark:border-gray-600 bg-white gap-4 p-4 md:p-8 rounded-lg mb-4">
          <div className="overflow-x-auto">
            <Table striped hoverable>
              <Table.Head>
                <Table.HeadCell>Invoice ID</Table.HeadCell>
                <Table.HeadCell>Client</Table.HeadCell>
                <Table.HeadCell className="pl-0">Status</Table.HeadCell>
                <Table.HeadCell>Price</Table.HeadCell>
                <Table.HeadCell>
                  <span className="sr-only">Edit</span>
                </Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {invoices.map((invoice, key) => (
                  <Table.Row
                    key={key}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {invoice.attributes.name}
                    </Table.Cell>
                    <Table.Cell>
                      {invoice.attributes.client.data.attributes.name}
                    </Table.Cell>
                    <Table.Cell
                      className={`bg-${
                        invoice.attributes.paid ? "green" : "red"
                      }-400 text-white`}
                    >{`${
                      invoice.attributes.paid ? "Paid" : "Outstanding"
                    }`}</Table.Cell>
                    <Table.Cell>$2999</Table.Cell>
                    <Table.Cell>
                      <Link
                        href={`/billing/${invoice.id}`}
                        className="font-medium text-cyan-600 hover:underline dark:text-cyan-500"
                      >
                        View
                      </Link>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}
