// components/RevenueChart.js

"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { off } from "process";

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
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const monthlyTotals = Array(12).fill(0);
    let yearOfInvoices = undefined;

    invoices.forEach((invoice) => {
      const { total, datePaid } = invoice.attributes;
      const date = new Date(datePaid);
      const year = date.getFullYear();
      yearOfInvoices = year;
      const month = date.getMonth();

      if (year <= currentYear) {
        monthlyTotals[month] += total;
      }
    });

    // Fill future months with null for the current year
    if (yearOfInvoices === currentYear) {
      for (let i = currentMonth + 1; i < 12; i++) {
        monthlyTotals[i] = null;
      }
    }

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

  /**
   * Gets the invoices sorted by year and filtered to include only those paid in the last 30 days.
   * @param {Array} invoices - The array of invoices.
   * @returns {Object} An object with the series name "revenue" and arrays of invoices sorted by year.
   */
  const getMonthsWorthOfInvoices = (invoices) => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // Filter invoices paid in the last 30 days
    const filteredInvoices = invoices.filter((invoice) => {
      const datePaid = new Date(invoice.attributes.datePaid);
      return datePaid >= thirtyDaysAgo && datePaid <= today;
    });

    // Group invoices by year
    const groupedInvoices = filteredInvoices.reduce((acc, invoice) => {
      const year = new Date(invoice.attributes.datePaid).getFullYear();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(invoice);
      return acc;
    }, {});

    // Return the result as specified
    return {
      series: "revenue",
      data: groupedInvoices,
    };
  };

  /**
   * Gets the invoices sorted by year and filtered to include only those paid in the last 7 days.
   * @param {Array} invoices - The array of invoices.
   * @returns {Object} An object with the series name "revenue" and arrays of invoices sorted by year.
   */
  const getWeeksWorthOfInvoices = (invoices) => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    // Filter invoices paid in the last 7 days
    const filteredInvoices = invoices.filter((invoice) => {
      const datePaid = new Date(invoice.attributes.datePaid);
      return datePaid >= sevenDaysAgo && datePaid <= today;
    });

    // Group invoices by year
    const groupedInvoices = filteredInvoices.reduce((acc, invoice) => {
      const year = new Date(invoice.attributes.datePaid).getFullYear();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(invoice);
      return acc;
    }, {});

    // Return the result as specified
    return {
      series: "revenue",
      data: groupedInvoices,
    };
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
        offsetY: 30,
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
        shadeIntensity: 0.1,
        opacityFrom: 0.7,
        opacityTo: 0,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      offsetY: 0,
    },
    xaxis: {
      type: "category",
      categories: monthNames,
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
        formatter: (value) =>
          value ? `$${value.toFixed(2)}` : "Not Available",
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
      <div
        ref={chartRef}
        className="w-full mt-auto"
        style={{ height: "300px" }}
      >
        <ApexChart
          type="area"
          options={revenueOption}
          series={revenueSeries}
          height={"100%"}
          width="100%"
        />
      </div>
    </>
  );
};

export default RevenueChart;
