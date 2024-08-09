import dynamic from "next/dynamic";
import { off } from "process";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function StructuresGroupProgress({ structures = [] }) {
  const statusCounts = structures.reduce((acc, structure) => {
    const status = structure.attributes.status;
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

  //   const series = [
  //     {
  //       name: "Marine Sprite",
  //       data: [44],
  //     },
  //     {
  //       name: "Striking Calf",
  //       data: [53],
  //     },
  //     {
  //       name: "Tank Picture",
  //       data: [12],
  //     },
  //     {
  //       name: "Bucket Slope",
  //       data: [9],
  //     },
  //     {
  //       name: "Reborn Kid",
  //       data: [25],
  //     },
  //   ];

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
  };

  return (
    <div className=" w-[150px] h-[65px] -mb-[15px] -mt-[27px]">
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
