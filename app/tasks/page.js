"use client";

import { Table, Modal, Button } from "flowbite-react";
import ActivityLog from "../../components/ActivityLog";
import ImageCardGrid from "../../components/ImageCardGrid";
import { useState } from "react";

export default function Page({ params }) {
  const [openModal, setOpenModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([
    {
      attributes: {
        name: 'Apple MacBook Pro 17"',
        urgency: "Urgent",
        dueDate: "2021-12-31",
        assignedBy: "John Doe",
        created: "2021-12-01",
        isComplete: false,
        documents: {
          data: [
            {
              id: 26,
              attributes: {
                name: "Jan 27, 2024, 12_03 PM.csv",
                alternativeText: null,
                caption: null,
                width: null,
                height: null,
                formats: null,
                hash: "Jan_27_2024_12_03_PM_b73120ca2e",
                ext: ".csv",
                mime: "text/csv",
                size: 0.37,
                url: "/uploads/Jan_27_2024_12_03_PM_b73120ca2e.csv",
                previewUrl: null,
                provider: "local",
                provider_metadata: null,
                createdAt: "2024-02-01T19:20:11.155Z",
                updatedAt: "2024-02-01T19:20:11.155Z",
                related: [
                  {
                    __type: "api::inspection.inspection",
                    id: 11,
                    name: "Ex. 1 Map 323343",
                    createdAt: "2023-11-17T19:52:58.250Z",
                    updatedAt: "2024-04-01T16:24:55.007Z",
                    publishedAt: "2023-11-17T19:52:57.899Z",
                  },
                ],
              },
            },
            {
              id: 27,
              attributes: {
                name: "Website _ Production_402583578878193_PageView_Jan 27, 2024, 12_00 PM.csv",
                alternativeText: null,
                caption: null,
                width: null,
                height: null,
                formats: null,
                hash: "Website_Production_402583578878193_Page_View_Jan_27_2024_12_00_PM_6c8c223a64",
                ext: ".csv",
                mime: "text/csv",
                size: 3.3,
                url: "/uploads/Website_Production_402583578878193_Page_View_Jan_27_2024_12_00_PM_6c8c223a64.csv",
                previewUrl: null,
                provider: "local",
                provider_metadata: null,
                createdAt: "2024-02-01T19:20:11.163Z",
                updatedAt: "2024-02-01T19:20:11.163Z",
                related: [
                  {
                    __type: "api::inspection.inspection",
                    id: 11,
                    name: "Ex. 1 Map 323343",
                    createdAt: "2023-11-17T19:52:58.250Z",
                    updatedAt: "2024-04-01T16:24:55.007Z",
                    publishedAt: "2023-11-17T19:52:57.899Z",
                  },
                ],
              },
            },
            {
              id: 28,
              attributes: {
                name: "Screenshot 202fdsfds.png",
                alternativeText: null,
                caption: null,
                width: 1425,
                height: 856,
                formats: {
                  thumbnail: {
                    name: "thumbnail_Screenshot 202fdsfds.png",
                    hash: "thumbnail_Screenshot_202fdsfds_e54c635d49",
                    ext: ".png",
                    mime: "image/png",
                    path: null,
                    width: 245,
                    height: 147,
                    size: 61.92,
                    url: "/uploads/thumbnail_Screenshot_202fdsfds_e54c635d49.png",
                  },
                  small: {
                    name: "small_Screenshot 202fdsfds.png",
                    hash: "small_Screenshot_202fdsfds_e54c635d49",
                    ext: ".png",
                    mime: "image/png",
                    path: null,
                    width: 500,
                    height: 300,
                    size: 208.99,
                    url: "/uploads/small_Screenshot_202fdsfds_e54c635d49.png",
                  },
                  medium: {
                    name: "medium_Screenshot 202fdsfds.png",
                    hash: "medium_Screenshot_202fdsfds_e54c635d49",
                    ext: ".png",
                    mime: "image/png",
                    path: null,
                    width: 750,
                    height: 451,
                    size: 399.97,
                    url: "/uploads/medium_Screenshot_202fdsfds_e54c635d49.png",
                  },
                  large: {
                    name: "large_Screenshot 202fdsfds.png",
                    hash: "large_Screenshot_202fdsfds_e54c635d49",
                    ext: ".png",
                    mime: "image/png",
                    path: null,
                    width: 1000,
                    height: 601,
                    size: 628.67,
                    url: "/uploads/large_Screenshot_202fdsfds_e54c635d49.png",
                  },
                },
                hash: "Screenshot_202fdsfds_e54c635d49",
                ext: ".png",
                mime: "image/png",
                size: 257.92,
                url: "/uploads/Screenshot_202fdsfds_e54c635d49.png",
                previewUrl: null,
                provider: "local",
                provider_metadata: null,
                createdAt: "2024-02-01T19:20:11.597Z",
                updatedAt: "2024-02-01T19:20:11.597Z",
                related: [
                  {
                    __type: "api::inspection.inspection",
                    id: 11,
                    name: "Ex. 1 Map 323343",
                    createdAt: "2023-11-17T19:52:58.250Z",
                    updatedAt: "2024-04-01T16:24:55.007Z",
                    publishedAt: "2023-11-17T19:52:57.899Z",
                  },
                ],
              },
            },
          ],
        },

        description:
          "Complete the system setup and software installation for the new MacBook Pro intended for the design team.",
      },
    },
    {
      attributes: {
        name: 'Dell XPS 15"',
        urgency: "High",
        dueDate: "2022-01-15",
        assignedBy: "Alice Smith",
        created: "2021-12-05",
        isComplete: false,
        documents: {
          data: [
            {
              id: 26,
              attributes: {
                name: "Jan 27, 2024, 12_03 PM.csv",
                alternativeText: null,
                caption: null,
                width: null,
                height: null,
                formats: null,
                hash: "Jan_27_2024_12_03_PM_b73120ca2e",
                ext: ".csv",
                mime: "text/csv",
                size: 0.37,
                url: "/uploads/Jan_27_2024_12_03_PM_b73120ca2e.csv",
                previewUrl: null,
                provider: "local",
                provider_metadata: null,
                createdAt: "2024-02-01T19:20:11.155Z",
                updatedAt: "2024-02-01T19:20:11.155Z",
                related: [
                  {
                    __type: "api::inspection.inspection",
                    id: 11,
                    name: "Ex. 1 Map 323343",
                    createdAt: "2023-11-17T19:52:58.250Z",
                    updatedAt: "2024-04-01T16:24:55.007Z",
                    publishedAt: "2023-11-17T19:52:57.899Z",
                  },
                ],
              },
            },
            {
              id: 27,
              attributes: {
                name: "Website _ Production_402583578878193_PageView_Jan 27, 2024, 12_00 PM.csv",
                alternativeText: null,
                caption: null,
                width: null,
                height: null,
                formats: null,
                hash: "Website_Production_402583578878193_Page_View_Jan_27_2024_12_00_PM_6c8c223a64",
                ext: ".csv",
                mime: "text/csv",
                size: 3.3,
                url: "/uploads/Website_Production_402583578878193_Page_View_Jan_27_2024_12_00_PM_6c8c223a64.csv",
                previewUrl: null,
                provider: "local",
                provider_metadata: null,
                createdAt: "2024-02-01T19:20:11.163Z",
                updatedAt: "2024-02-01T19:20:11.163Z",
                related: [
                  {
                    __type: "api::inspection.inspection",
                    id: 11,
                    name: "Ex. 1 Map 323343",
                    createdAt: "2023-11-17T19:52:58.250Z",
                    updatedAt: "2024-04-01T16:24:55.007Z",
                    publishedAt: "2023-11-17T19:52:57.899Z",
                  },
                ],
              },
            },
            {
              id: 28,
              attributes: {
                name: "Screenshot 202fdsfds.png",
                alternativeText: null,
                caption: null,
                width: 1425,
                height: 856,
                formats: {
                  thumbnail: {
                    name: "thumbnail_Screenshot 202fdsfds.png",
                    hash: "thumbnail_Screenshot_202fdsfds_e54c635d49",
                    ext: ".png",
                    mime: "image/png",
                    path: null,
                    width: 245,
                    height: 147,
                    size: 61.92,
                    url: "/uploads/thumbnail_Screenshot_202fdsfds_e54c635d49.png",
                  },
                  small: {
                    name: "small_Screenshot 202fdsfds.png",
                    hash: "small_Screenshot_202fdsfds_e54c635d49",
                    ext: ".png",
                    mime: "image/png",
                    path: null,
                    width: 500,
                    height: 300,
                    size: 208.99,
                    url: "/uploads/small_Screenshot_202fdsfds_e54c635d49.png",
                  },
                  medium: {
                    name: "medium_Screenshot 202fdsfds.png",
                    hash: "medium_Screenshot_202fdsfds_e54c635d49",
                    ext: ".png",
                    mime: "image/png",
                    path: null,
                    width: 750,
                    height: 451,
                    size: 399.97,
                    url: "/uploads/medium_Screenshot_202fdsfds_e54c635d49.png",
                  },
                  large: {
                    name: "large_Screenshot 202fdsfds.png",
                    hash: "large_Screenshot_202fdsfds_e54c635d49",
                    ext: ".png",
                    mime: "image/png",
                    path: null,
                    width: 1000,
                    height: 601,
                    size: 628.67,
                    url: "/uploads/large_Screenshot_202fdsfds_e54c635d49.png",
                  },
                },
                hash: "Screenshot_202fdsfds_e54c635d49",
                ext: ".png",
                mime: "image/png",
                size: 257.92,
                url: "/uploads/Screenshot_202fdsfds_e54c635d49.png",
                previewUrl: null,
                provider: "local",
                provider_metadata: null,
                createdAt: "2024-02-01T19:20:11.597Z",
                updatedAt: "2024-02-01T19:20:11.597Z",
                related: [
                  {
                    __type: "api::inspection.inspection",
                    id: 11,
                    name: "Ex. 1 Map 323343",
                    createdAt: "2023-11-17T19:52:58.250Z",
                    updatedAt: "2024-04-01T16:24:55.007Z",
                    publishedAt: "2023-11-17T19:52:57.899Z",
                  },
                ],
              },
            },
          ],
        },
        description:
          "Review and update the security protocols on the Dell XPS laptops to meet the new IT guidelines.",
      },
    },
    {
      attributes: {
        name: "Lenovo ThinkPad X1",
        urgency: "Medium",
        dueDate: "2022-01-30",
        assignedBy: "Bob Johnson",
        created: "2021-12-10",
        isComplete: false,
        documents: {
          data: [
            {
              id: 26,
              attributes: {
                name: "Jan 27, 2024, 12_03 PM.csv",
                alternativeText: null,
                caption: null,
                width: null,
                height: null,
                formats: null,
                hash: "Jan_27_2024_12_03_PM_b73120ca2e",
                ext: ".csv",
                mime: "text/csv",
                size: 0.37,
                url: "/uploads/Jan_27_2024_12_03_PM_b73120ca2e.csv",
                previewUrl: null,
                provider: "local",
                provider_metadata: null,
                createdAt: "2024-02-01T19:20:11.155Z",
                updatedAt: "2024-02-01T19:20:11.155Z",
                related: [
                  {
                    __type: "api::inspection.inspection",
                    id: 11,
                    name: "Ex. 1 Map 323343",
                    createdAt: "2023-11-17T19:52:58.250Z",
                    updatedAt: "2024-04-01T16:24:55.007Z",
                    publishedAt: "2023-11-17T19:52:57.899Z",
                  },
                ],
              },
            },
            {
              id: 27,
              attributes: {
                name: "Website _ Production_402583578878193_PageView_Jan 27, 2024, 12_00 PM.csv",
                alternativeText: null,
                caption: null,
                width: null,
                height: null,
                formats: null,
                hash: "Website_Production_402583578878193_Page_View_Jan_27_2024_12_00_PM_6c8c223a64",
                ext: ".csv",
                mime: "text/csv",
                size: 3.3,
                url: "/uploads/Website_Production_402583578878193_Page_View_Jan_27_2024_12_00_PM_6c8c223a64.csv",
                previewUrl: null,
                provider: "local",
                provider_metadata: null,
                createdAt: "2024-02-01T19:20:11.163Z",
                updatedAt: "2024-02-01T19:20:11.163Z",
                related: [
                  {
                    __type: "api::inspection.inspection",
                    id: 11,
                    name: "Ex. 1 Map 323343",
                    createdAt: "2023-11-17T19:52:58.250Z",
                    updatedAt: "2024-04-01T16:24:55.007Z",
                    publishedAt: "2023-11-17T19:52:57.899Z",
                  },
                ],
              },
            },
            {
              id: 28,
              attributes: {
                name: "Screenshot 202fdsfds.png",
                alternativeText: null,
                caption: null,
                width: 1425,
                height: 856,
                formats: {
                  thumbnail: {
                    name: "thumbnail_Screenshot 202fdsfds.png",
                    hash: "thumbnail_Screenshot_202fdsfds_e54c635d49",
                    ext: ".png",
                    mime: "image/png",
                    path: null,
                    width: 245,
                    height: 147,
                    size: 61.92,
                    url: "/uploads/thumbnail_Screenshot_202fdsfds_e54c635d49.png",
                  },
                  small: {
                    name: "small_Screenshot 202fdsfds.png",
                    hash: "small_Screenshot_202fdsfds_e54c635d49",
                    ext: ".png",
                    mime: "image/png",
                    path: null,
                    width: 500,
                    height: 300,
                    size: 208.99,
                    url: "/uploads/small_Screenshot_202fdsfds_e54c635d49.png",
                  },
                  medium: {
                    name: "medium_Screenshot 202fdsfds.png",
                    hash: "medium_Screenshot_202fdsfds_e54c635d49",
                    ext: ".png",
                    mime: "image/png",
                    path: null,
                    width: 750,
                    height: 451,
                    size: 399.97,
                    url: "/uploads/medium_Screenshot_202fdsfds_e54c635d49.png",
                  },
                  large: {
                    name: "large_Screenshot 202fdsfds.png",
                    hash: "large_Screenshot_202fdsfds_e54c635d49",
                    ext: ".png",
                    mime: "image/png",
                    path: null,
                    width: 1000,
                    height: 601,
                    size: 628.67,
                    url: "/uploads/large_Screenshot_202fdsfds_e54c635d49.png",
                  },
                },
                hash: "Screenshot_202fdsfds_e54c635d49",
                ext: ".png",
                mime: "image/png",
                size: 257.92,
                url: "/uploads/Screenshot_202fdsfds_e54c635d49.png",
                previewUrl: null,
                provider: "local",
                provider_metadata: null,
                createdAt: "2024-02-01T19:20:11.597Z",
                updatedAt: "2024-02-01T19:20:11.597Z",
                related: [
                  {
                    __type: "api::inspection.inspection",
                    id: 11,
                    name: "Ex. 1 Map 323343",
                    createdAt: "2023-11-17T19:52:58.250Z",
                    updatedAt: "2024-04-01T16:24:55.007Z",
                    publishedAt: "2023-11-17T19:52:57.899Z",
                  },
                ],
              },
            },
          ],
        },
        description:
          "Prepare the Lenovo ThinkPad X1 for the new interns starting next month with necessary software and access rights.",
      },
    },
    {
      attributes: {
        name: "HP Spectre x360",
        urgency: "Low",
        dueDate: "2022-02-20",
        assignedBy: "Clara Oswald",
        created: "2021-12-15",
        isComplete: false,
        documents: {
          data: [
            {
              id: 26,
              attributes: {
                name: "Jan 27, 2024, 12_03 PM.csv",
                alternativeText: null,
                caption: null,
                width: null,
                height: null,
                formats: null,
                hash: "Jan_27_2024_12_03_PM_b73120ca2e",
                ext: ".csv",
                mime: "text/csv",
                size: 0.37,
                url: "/uploads/Jan_27_2024_12_03_PM_b73120ca2e.csv",
                previewUrl: null,
                provider: "local",
                provider_metadata: null,
                createdAt: "2024-02-01T19:20:11.155Z",
                updatedAt: "2024-02-01T19:20:11.155Z",
                related: [
                  {
                    __type: "api::inspection.inspection",
                    id: 11,
                    name: "Ex. 1 Map 323343",
                    createdAt: "2023-11-17T19:52:58.250Z",
                    updatedAt: "2024-04-01T16:24:55.007Z",
                    publishedAt: "2023-11-17T19:52:57.899Z",
                  },
                ],
              },
            },
            {
              id: 27,
              attributes: {
                name: "Website _ Production_402583578878193_PageView_Jan 27, 2024, 12_00 PM.csv",
                alternativeText: null,
                caption: null,
                width: null,
                height: null,
                formats: null,
                hash: "Website_Production_402583578878193_Page_View_Jan_27_2024_12_00_PM_6c8c223a64",
                ext: ".csv",
                mime: "text/csv",
                size: 3.3,
                url: "/uploads/Website_Production_402583578878193_Page_View_Jan_27_2024_12_00_PM_6c8c223a64.csv",
                previewUrl: null,
                provider: "local",
                provider_metadata: null,
                createdAt: "2024-02-01T19:20:11.163Z",
                updatedAt: "2024-02-01T19:20:11.163Z",
                related: [
                  {
                    __type: "api::inspection.inspection",
                    id: 11,
                    name: "Ex. 1 Map 323343",
                    createdAt: "2023-11-17T19:52:58.250Z",
                    updatedAt: "2024-04-01T16:24:55.007Z",
                    publishedAt: "2023-11-17T19:52:57.899Z",
                  },
                ],
              },
            },
            {
              id: 28,
              attributes: {
                name: "Screenshot 202fdsfds.png",
                alternativeText: null,
                caption: null,
                width: 1425,
                height: 856,
                formats: {
                  thumbnail: {
                    name: "thumbnail_Screenshot 202fdsfds.png",
                    hash: "thumbnail_Screenshot_202fdsfds_e54c635d49",
                    ext: ".png",
                    mime: "image/png",
                    path: null,
                    width: 245,
                    height: 147,
                    size: 61.92,
                    url: "/uploads/thumbnail_Screenshot_202fdsfds_e54c635d49.png",
                  },
                  small: {
                    name: "small_Screenshot 202fdsfds.png",
                    hash: "small_Screenshot_202fdsfds_e54c635d49",
                    ext: ".png",
                    mime: "image/png",
                    path: null,
                    width: 500,
                    height: 300,
                    size: 208.99,
                    url: "/uploads/small_Screenshot_202fdsfds_e54c635d49.png",
                  },
                  medium: {
                    name: "medium_Screenshot 202fdsfds.png",
                    hash: "medium_Screenshot_202fdsfds_e54c635d49",
                    ext: ".png",
                    mime: "image/png",
                    path: null,
                    width: 750,
                    height: 451,
                    size: 399.97,
                    url: "/uploads/medium_Screenshot_202fdsfds_e54c635d49.png",
                  },
                  large: {
                    name: "large_Screenshot 202fdsfds.png",
                    hash: "large_Screenshot_202fdsfds_e54c635d49",
                    ext: ".png",
                    mime: "image/png",
                    path: null,
                    width: 1000,
                    height: 601,
                    size: 628.67,
                    url: "/uploads/large_Screenshot_202fdsfds_e54c635d49.png",
                  },
                },
                hash: "Screenshot_202fdsfds_e54c635d49",
                ext: ".png",
                mime: "image/png",
                size: 257.92,
                url: "/uploads/Screenshot_202fdsfds_e54c635d49.png",
                previewUrl: null,
                provider: "local",
                provider_metadata: null,
                createdAt: "2024-02-01T19:20:11.597Z",
                updatedAt: "2024-02-01T19:20:11.597Z",
                related: [
                  {
                    __type: "api::inspection.inspection",
                    id: 11,
                    name: "Ex. 1 Map 323343",
                    createdAt: "2023-11-17T19:52:58.250Z",
                    updatedAt: "2024-04-01T16:24:55.007Z",
                    publishedAt: "2023-11-17T19:52:57.899Z",
                  },
                ],
              },
            },
          ],
        },
        description:
          "Conduct a performance review and hardware check on the HP Spectre x360 to ensure optimal operation.",
      },
    },
    {
      attributes: {
        name: "Asus ZenBook 14",
        urgency: "Urgent",
        dueDate: "2022-03-01",
        assignedBy: "Danny Phantom",
        created: "2021-12-20",
        isComplete: false,
        documents: {
          data: [
            {
              id: 26,
              attributes: {
                name: "Jan 27, 2024, 12_03 PM.csv",
                alternativeText: null,
                caption: null,
                width: null,
                height: null,
                formats: null,
                hash: "Jan_27_2024_12_03_PM_b73120ca2e",
                ext: ".csv",
                mime: "text/csv",
                size: 0.37,
                url: "/uploads/Jan_27_2024_12_03_PM_b73120ca2e.csv",
                previewUrl: null,
                provider: "local",
                provider_metadata: null,
                createdAt: "2024-02-01T19:20:11.155Z",
                updatedAt: "2024-02-01T19:20:11.155Z",
                related: [
                  {
                    __type: "api::inspection.inspection",
                    id: 11,
                    name: "Ex. 1 Map 323343",
                    createdAt: "2023-11-17T19:52:58.250Z",
                    updatedAt: "2024-04-01T16:24:55.007Z",
                    publishedAt: "2023-11-17T19:52:57.899Z",
                  },
                ],
              },
            },
            {
              id: 27,
              attributes: {
                name: "Website _ Production_402583578878193_PageView_Jan 27, 2024, 12_00 PM.csv",
                alternativeText: null,
                caption: null,
                width: null,
                height: null,
                formats: null,
                hash: "Website_Production_402583578878193_Page_View_Jan_27_2024_12_00_PM_6c8c223a64",
                ext: ".csv",
                mime: "text/csv",
                size: 3.3,
                url: "/uploads/Website_Production_402583578878193_Page_View_Jan_27_2024_12_00_PM_6c8c223a64.csv",
                previewUrl: null,
                provider: "local",
                provider_metadata: null,
                createdAt: "2024-02-01T19:20:11.163Z",
                updatedAt: "2024-02-01T19:20:11.163Z",
                related: [
                  {
                    __type: "api::inspection.inspection",
                    id: 11,
                    name: "Ex. 1 Map 323343",
                    createdAt: "2023-11-17T19:52:58.250Z",
                    updatedAt: "2024-04-01T16:24:55.007Z",
                    publishedAt: "2023-11-17T19:52:57.899Z",
                  },
                ],
              },
            },
            {
              id: 28,
              attributes: {
                name: "Screenshot 202fdsfds.png",
                alternativeText: null,
                caption: null,
                width: 1425,
                height: 856,
                formats: {
                  thumbnail: {
                    name: "thumbnail_Screenshot 202fdsfds.png",
                    hash: "thumbnail_Screenshot_202fdsfds_e54c635d49",
                    ext: ".png",
                    mime: "image/png",
                    path: null,
                    width: 245,
                    height: 147,
                    size: 61.92,
                    url: "/uploads/thumbnail_Screenshot_202fdsfds_e54c635d49.png",
                  },
                  small: {
                    name: "small_Screenshot 202fdsfds.png",
                    hash: "small_Screenshot_202fdsfds_e54c635d49",
                    ext: ".png",
                    mime: "image/png",
                    path: null,
                    width: 500,
                    height: 300,
                    size: 208.99,
                    url: "/uploads/small_Screenshot_202fdsfds_e54c635d49.png",
                  },
                  medium: {
                    name: "medium_Screenshot 202fdsfds.png",
                    hash: "medium_Screenshot_202fdsfds_e54c635d49",
                    ext: ".png",
                    mime: "image/png",
                    path: null,
                    width: 750,
                    height: 451,
                    size: 399.97,
                    url: "/uploads/medium_Screenshot_202fdsfds_e54c635d49.png",
                  },
                  large: {
                    name: "large_Screenshot 202fdsfds.png",
                    hash: "large_Screenshot_202fdsfds_e54c635d49",
                    ext: ".png",
                    mime: "image/png",
                    path: null,
                    width: 1000,
                    height: 601,
                    size: 628.67,
                    url: "/uploads/large_Screenshot_202fdsfds_e54c635d49.png",
                  },
                },
                hash: "Screenshot_202fdsfds_e54c635d49",
                ext: ".png",
                mime: "image/png",
                size: 257.92,
                url: "/uploads/Screenshot_202fdsfds_e54c635d49.png",
                previewUrl: null,
                provider: "local",
                provider_metadata: null,
                createdAt: "2024-02-01T19:20:11.597Z",
                updatedAt: "2024-02-01T19:20:11.597Z",
                related: [
                  {
                    __type: "api::inspection.inspection",
                    id: 11,
                    name: "Ex. 1 Map 323343",
                    createdAt: "2023-11-17T19:52:58.250Z",
                    updatedAt: "2024-04-01T16:24:55.007Z",
                    publishedAt: "2023-11-17T19:52:57.899Z",
                  },
                ],
              },
            },
          ],
        },
        description:
          "Coordinate with the procurement team to ensure the Asus ZenBook 14 is acquired and ready for the Q2 project launch.",
      },
    },
    {
      attributes: {
        name: "Microsoft Surface Laptop 4",
        urgency: "High",
        dueDate: "2022-03-15",
        assignedBy: "Eve Polastri",
        created: "2021-12-25",
        isComplete: true,
        documents: {
          data: [
            {
              id: 26,
              attributes: {
                name: "Jan 27, 2024, 12_03 PM.csv",
                alternativeText: null,
                caption: null,
                width: null,
                height: null,
                formats: null,
                hash: "Jan_27_2024_12_03_PM_b73120ca2e",
                ext: ".csv",
                mime: "text/csv",
                size: 0.37,
                url: "/uploads/Jan_27_2024_12_03_PM_b73120ca2e.csv",
                previewUrl: null,
                provider: "local",
                provider_metadata: null,
                createdAt: "2024-02-01T19:20:11.155Z",
                updatedAt: "2024-02-01T19:20:11.155Z",
                related: [
                  {
                    __type: "api::inspection.inspection",
                    id: 11,
                    name: "Ex. 1 Map 323343",
                    createdAt: "2023-11-17T19:52:58.250Z",
                    updatedAt: "2024-04-01T16:24:55.007Z",
                    publishedAt: "2023-11-17T19:52:57.899Z",
                  },
                ],
              },
            },
            {
              id: 27,
              attributes: {
                name: "Website _ Production_402583578878193_PageView_Jan 27, 2024, 12_00 PM.csv",
                alternativeText: null,
                caption: null,
                width: null,
                height: null,
                formats: null,
                hash: "Website_Production_402583578878193_Page_View_Jan_27_2024_12_00_PM_6c8c223a64",
                ext: ".csv",
                mime: "text/csv",
                size: 3.3,
                url: "/uploads/Website_Production_402583578878193_Page_View_Jan_27_2024_12_00_PM_6c8c223a64.csv",
                previewUrl: null,
                provider: "local",
                provider_metadata: null,
                createdAt: "2024-02-01T19:20:11.163Z",
                updatedAt: "2024-02-01T19:20:11.163Z",
                related: [
                  {
                    __type: "api::inspection.inspection",
                    id: 11,
                    name: "Ex. 1 Map 323343",
                    createdAt: "2023-11-17T19:52:58.250Z",
                    updatedAt: "2024-04-01T16:24:55.007Z",
                    publishedAt: "2023-11-17T19:52:57.899Z",
                  },
                ],
              },
            },
            {
              id: 28,
              attributes: {
                name: "Screenshot 202fdsfds.png",
                alternativeText: null,
                caption: null,
                width: 1425,
                height: 856,
                formats: {
                  thumbnail: {
                    name: "thumbnail_Screenshot 202fdsfds.png",
                    hash: "thumbnail_Screenshot_202fdsfds_e54c635d49",
                    ext: ".png",
                    mime: "image/png",
                    path: null,
                    width: 245,
                    height: 147,
                    size: 61.92,
                    url: "/uploads/thumbnail_Screenshot_202fdsfds_e54c635d49.png",
                  },
                  small: {
                    name: "small_Screenshot 202fdsfds.png",
                    hash: "small_Screenshot_202fdsfds_e54c635d49",
                    ext: ".png",
                    mime: "image/png",
                    path: null,
                    width: 500,
                    height: 300,
                    size: 208.99,
                    url: "/uploads/small_Screenshot_202fdsfds_e54c635d49.png",
                  },
                  medium: {
                    name: "medium_Screenshot 202fdsfds.png",
                    hash: "medium_Screenshot_202fdsfds_e54c635d49",
                    ext: ".png",
                    mime: "image/png",
                    path: null,
                    width: 750,
                    height: 451,
                    size: 399.97,
                    url: "/uploads/medium_Screenshot_202fdsfds_e54c635d49.png",
                  },
                  large: {
                    name: "large_Screenshot 202fdsfds.png",
                    hash: "large_Screenshot_202fdsfds_e54c635d49",
                    ext: ".png",
                    mime: "image/png",
                    path: null,
                    width: 1000,
                    height: 601,
                    size: 628.67,
                    url: "/uploads/large_Screenshot_202fdsfds_e54c635d49.png",
                  },
                },
                hash: "Screenshot_202fdsfds_e54c635d49",
                ext: ".png",
                mime: "image/png",
                size: 257.92,
                url: "/uploads/Screenshot_202fdsfds_e54c635d49.png",
                previewUrl: null,
                provider: "local",
                provider_metadata: null,
                createdAt: "2024-02-01T19:20:11.597Z",
                updatedAt: "2024-02-01T19:20:11.597Z",
                related: [
                  {
                    __type: "api::inspection.inspection",
                    id: 11,
                    name: "Ex. 1 Map 323343",
                    createdAt: "2023-11-17T19:52:58.250Z",
                    updatedAt: "2024-04-01T16:24:55.007Z",
                    publishedAt: "2023-11-17T19:52:57.899Z",
                  },
                ],
              },
            },
          ],
        },
        description:
          "Verify software compatibility on all Surface Laptop 4 devices and update to the latest Windows version.",
      },
    },
    {
      attributes: {
        name: "Acer Swift 3",
        urgency: "Medium",
        dueDate: "2022-04-01",
        assignedBy: "Frank Castle",
        created: "2021-12-30",
        isComplete: true,
        documents: {
          data: [],
        },
        description:
          "Arrange for the Acer Swift 3 units to be upgraded with additional RAM to handle more intensive applications.",
      },
    },
    {
      attributes: {
        name: "Samsung Galaxy Book",
        urgency: "Low",
        dueDate: "2022-04-15",
        assignedBy: "Gina Linetti",
        created: "2022-01-01",
        isComplete: true,
        documents: {
          data: [],
        },
        description:
          "Create an onboarding guide for Samsung Galaxy Book users focusing on mobile and remote working capabilities.",
      },
    },
    {
      attributes: {
        name: 'MacBook Air 13"',
        urgency: "Urgent",
        dueDate: "2022-05-01",
        assignedBy: "Hank Moody",
        created: "2022-01-05",
        isComplete: false,
        documents: {
          data: [],
        },
        description:
          "Ensure all MacBook Air laptops are updated to the latest macOS and check for any software licensing issues.",
      },
    },
    {
      attributes: {
        name: "Alienware m15",
        urgency: "High",
        dueDate: "2022-05-15",
        assignedBy: "Ivy Dickens",
        created: "2022-01-10",
        isComplete: true,
        documents: {
          data: [],
        },
        description:
          "Optimize the Alienware m15 setups for gaming development projects, including GPU and memory performance tests.",
      },
    },
  ]);

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification("Permission Granted!");
      }
    }
  };

  const sendNotification = () => {
    if ("Notification" in window) {
      new Notification("You have a new task assigned!");
    }
  };

  return (
    <div className="flex flex-col justify-between py-6">
      <section className="overflow-x-auto bg-transparent">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Task Name</Table.HeadCell>
            <Table.HeadCell>Task Description</Table.HeadCell>
            <Table.HeadCell>Urgency</Table.HeadCell>
            <Table.HeadCell>Due Date</Table.HeadCell>
            <Table.HeadCell>Price</Table.HeadCell>
            <Table.HeadCell>
              <span className="sr-only">Edit</span>
            </Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {tasks.map((task, index) => (
              <Table.Row
                key={index}
                className="bg-white dark:border-gray-700 dark:bg-gray-800"
                onClick={() => {
                  setOpenModal(true);
                  setSelectedTask(task);
                }}
              >
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                  {task.attributes.name}
                </Table.Cell>
                <Table.Cell className="font-medium text-gray-900 dark:text-white">
                  {task.attributes.description.slice(0, 30) + "..."}
                </Table.Cell>
                <Table.Cell>{task.attributes.urgency}</Table.Cell>
                <Table.Cell>{task.attributes.dueDate}</Table.Cell>
                <Table.Cell>{task.attributes.created}</Table.Cell>
                <Table.Cell>{task.attributes.isComplete}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </section>

      <section>
        <Modal show={openModal} onClose={() => setOpenModal(false)} size="7xl">
          <Modal.Header>Terms of Service</Modal.Header>
          <Modal.Body className="p-0">
            <section className="flex">
              <div className="w-full p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {selectedTask && selectedTask.attributes.name}
                </h2>
                <div className=" h-24 overflow-auto">
                  <p className="text-gray-600 dark:text-gray-300 mb-5">
                    {selectedTask && selectedTask.attributes.description}
                  </p>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Urgency: {selectedTask && selectedTask.attributes.urgency}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Due Date: {selectedTask && selectedTask.attributes.dueDate}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Assigned By:{" "}
                  {selectedTask && selectedTask.attributes.assignedBy}
                </p>

                <div className=" mt-8">
                  <ImageCardGrid
                    files={
                      (selectedTask &&
                        selectedTask.attributes.documents.data) ||
                      []
                    }
                    background={"bg-white"}
                    editMode={false}
                    columns={3}
                    padded={false}
                  />
                </div>
              </div>
              <div className="w-full p-6 bg-gray-100">
                <ActivityLog
                  id={11}
                  collection="inspections"
                  defaultExpanded={true}
                />
              </div>
            </section>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => requestNotificationPermission()}>
              I accept
            </Button>
            <Button color="gray" onClick={() => sendNotification()}>
              Decline
            </Button>
          </Modal.Footer>
        </Modal>
      </section>
    </div>
  );
}
