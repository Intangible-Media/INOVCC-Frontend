// components/RevenueChart.js

"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const RevenueChart = ({ invoices }) => {
  const chartRef = useRef(null);
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentMonthName = monthNames[currentMonth];

  useEffect(() => {
    if (chartRef.current) {
      const chartWidth = chartRef.current.offsetWidth;
      console.log(`Chart Width: ${chartWidth}px`);
    }
  }, []);

  const groupInvoicesByYear = (invoices) => {
    return invoices.reduce((acc, invoice) => {
      const { datePaid } = invoice.attributes;
      const year = new Date(datePaid).getFullYear();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(invoice);
      return acc;
    }, {});
  };

  const getMonthlyTotals = (invoices) => {
    const monthlyTotals = Array(12).fill(0);

    invoices.forEach((invoice) => {
      const { total, datePaid } = invoice.attributes;
      const month = new Date(datePaid).getMonth();
      monthlyTotals[month] += total;
    });

    return monthlyTotals;
  };

  const calculatePercentageChange = (totals) => {
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const currentTotal = totals[currentMonth];
    const previousTotal = totals[previousMonth];

    if (previousTotal === 0) {
      return currentTotal === 0 ? 0 : 100;
    }

    return ((currentTotal - previousTotal) / previousTotal) * 100;
  };

  const groupedInvoices = groupInvoicesByYear(invoices);
  const totalSum = invoices
    .reduce((acc, invoice) => acc + invoice.attributes.total, 0)
    .toLocaleString();
  const percentageChange = calculatePercentageChange(
    getMonthlyTotals(groupedInvoices[currentYear] || [])
  );

  const revenueOption = {
    chart: {
      id: "apexchart-example-alt",
      toolbar: {
        show: true,
      },
      sparkline: {
        enabled: true,
      },
      zoom: {
        autoScaleYaxis: true,
      },
    },
    grid: {
      show: false,
    },
    colors: ["#62C3F7", "#F762A4", "#F7F162"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 100],
        colorStops: [
          {
            offset: 0,
            color: "#62C3F7",
            opacity: 0.6,
          },
          {
            offset: 100,
            color: "#62C3F7",
            opacity: 0.0,
          },
        ],
      },
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      labels: {
        show: true,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      show: false,
    },
    tooltip: {
      y: {
        formatter: (value) => `$${value.toFixed(2)}`,
      },
    },
    annotations: {
      xaxis: [
        {
          x: (chartRef.current?.offsetWidth / 12) * currentMonth + 1 || 0,
          x2: (chartRef.current?.offsetWidth / 12) * (currentMonth + 1) || 0,
          borderColor: "#FF4560",
          label: {
            borderColor: "#FF4560",
            style: {
              color: "#fff",
              background: "#FF4560",
            },
            text: `Current Month ${currentMonthName}`,
          },
        },
      ],
    },
  };

  const revenueSeries = Object.keys(groupedInvoices).map((year) => ({
    name: year,
    data: getMonthlyTotals(groupedInvoices[year]),
  }));

  return (
    <>
      <div className="flex justify-between h-11">
        <h3 className="text-3xl font-bold dark:text-white">${totalSum}</h3>
        <div>
          <span
            className={`text-base font-semibold ${
              percentageChange > 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {percentageChange.toFixed(2)}%
          </span>
        </div>
      </div>
      <p className="text-gray-500 mb-4">Revenue YTD</p>
      <div ref={chartRef} className="w-full mt-auto">
        <ApexChart
          type="area"
          options={revenueOption}
          series={revenueSeries}
          height={250}
          width="100%"
        />
      </div>
    </>
  );
};

export default RevenueChart;
