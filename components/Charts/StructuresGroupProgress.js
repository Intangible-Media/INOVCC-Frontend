import dynamic from "next/dynamic";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: true });

export default function StructuresGroupProgress({ structures = [] }) {
  // Mapping of statuses to their respective colors
  const statusColors = {
    Uploaded: "#046C4E",
    "Cannot Locate": "#EC4899", // Assign a color as needed
    "Not Inspected": "#EAB308",
    Inspected: "#10B981",
    Urgent: "#E11D48",
    "New Pole": "#0EA5E9",
    "Metal Pole": "#D946EF",
    "Not at Home": "#F97316",
    Reschedule: "#F472B6",
    "Access Issue": "#EF4444",
  };

  const statusCounts = structures.reduce((acc, structure) => {
    let status = structure.attributes.status;

    // Check for the special case where status is "Inspected" and adminStatus is "Uploaded"
    if (
      status === "Inspected" &&
      structure.attributes.adminStatus === "Uploaded"
    ) {
      status = "Uploaded";
    }

    if (!acc[status]) {
      acc[status] = 0;
    }
    acc[status]++;
    return acc;
  }, {});

  // Convert the statusCounts object into series data
  const series = Object.keys(statusCounts).map((status) => ({
    name: status,
    data: [statusCounts[status]],
  }));

  // Extract the colors for each series based on the status
  const colors = Object.keys(statusCounts).map((status) => {
    if (!statusColors[status]) {
      console.warn(
        `No color mapped for status: ${status}. Using default color.`
      );
    }
    return statusColors[status];
  });

  const options = {
    chart: {
      stacked: true,
      stackType: "100%",
      borderColor: "transparent", // Remove chart borders
      toolbar: {
        show: false, // Hide the download hamburger button
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        dataLabels: {
          show: false, // Hide labels on bars
        },
      },
    },
    dataLabels: {
      enabled: false,
      textAnchor: "start",
      style: {
        colors: ["#fff"],
      },
      formatter: function (val, opt) {
        return "";
      },
      offsetX: 0,
      dropShadow: {
        enabled: false,
      },
    },
    xaxis: {
      labels: {
        show: false, // Hide X-axis labels
      },
      axisBorder: {
        show: false, // Hide X-axis border
      },
      axisTicks: {
        show: false, // Hide X-axis ticks
      },
    },
    yaxis: {
      show: false, // Hide Y-axis completely
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val;
        },
      },
    },
    fill: {
      opacity: 1,
    },
    legend: {
      show: false, // Hide legend
    },
    grid: {
      padding: {
        left: 0,
        right: 0,
      },
    },
    colors: colors, // Apply the correct colors based on the status
  };

  return (
    <div className="w-[150px] h-[65px] -mb-[15px] -mt-[27px]">
      <ApexChart
        type="bar"
        series={series}
        options={options}
        height={"100%"}
        width="100%"
      />
    </div>
  );
}
