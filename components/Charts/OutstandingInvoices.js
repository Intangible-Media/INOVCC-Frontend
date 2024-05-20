// components/OutstandingInvoices.js

"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const OutstandingInvoices = ({ invoices }) => {
  const chartRef = useRef(null);

  const options = {
    series: [44, 55, 13],
    chart: {
      width: 380,
      type: "donut",
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            show: false,
          },
        },
      },
    ],
    labels: ["Overdue", "Paid in Full", "Outstanding"], // Custom legend names
    legend: {
      position: "right",
      offsetY: 0,
    },
  };

  return (
    <>
      <div className="flex justify-between h-11">
        <h3 className="text-3xl font-bold dark:text-white">$43,872</h3>
      </div>
      <p className="text-gray-500 mb-4">Revenue YTD</p>
      <div ref={chartRef} className="w-full mt-auto">
        <ApexChart
          type="donut"
          options={options}
          series={options.series}
          height={400}
          width="100%"
        />
      </div>
    </>
  );
};

export default OutstandingInvoices;
