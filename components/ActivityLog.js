import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import qs from "qs";
import { ensureDomain } from "../utils/strings";

export default function ActivityLog({ id, collection }) {
  const [activityGroups, setActivityGroups] = useState([]);
  const { data: session, loading } = useSession();

  function groupByCreationDate(data) {
    const groups = {};

    data.forEach((item) => {
      // Extract the date part from the 'createdAt' property
      const date = item.attributes.createdAt.split("T")[0];

      // Initialize the array for this date if it doesn't already exist
      if (!groups[date]) {
        groups[date] = [];
      }

      // Add the current item to the array for its creation date
      groups[date].push(item);
    });

    // Convert the groups object back into an array of arrays
    return Object.values(groups);
  }

  function formatAbbreviatedDate(dateString) {
    const monthAbbreviations = [
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
    ];

    const date = new Date(dateString);

    // Extract the day of the month
    const day = date.getDate();

    // Abbreviate the month
    const month = monthAbbreviations[date.getMonth()];

    // Format the time
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? "0" + minutes : minutes;

    const time = `${hours}:${minutesStr}${ampm}`;

    return { day, month, time };
  }

  function formatDateToString(dateString) {
    const months = [
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

    const date = new Date(dateString);

    // Full month name
    const month = months[date.getMonth()];

    // Day of the month
    const day = date.getDate();

    // Year
    const year = date.getFullYear();

    // Formatting time
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";

    hours = hours % 12;
    hours = hours ? hours : 12; // Convert '0' hours to '12'
    const minutesStr = minutes < 10 ? "0" + minutes : minutes;

    const time = `${hours}:${minutesStr}${ampm}`;

    return `${month} ${day}, ${year} / ${time}`;
  }

  // filters: {
  //   collection: {
  //     $eq: collection,
  //   },
  //   collectionId: {
  //     $eq: id,
  //   },
  // },

  useEffect(() => {
    console.log(id, collection);
    const query = qs.stringify(
      {
        sort: ["createdAt:desc"],
        populate: {
          user: {
            populate: {
              picture: "*", // Populate the 'picture' relation
            },
            fields: ["firstName", "lastName"],
          },
        },
      },
      {
        encodeValuesOnly: true, // This option is necessary to prevent qs from encoding the comma in the fields array
      }
    );

    const fetchActivities = async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/activities?${query}`,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );

      console.log("data");
      console.log(groupByCreationDate(response.data.data));

      setActivityGroups(groupByCreationDate(response.data.data));
    };

    fetchActivities();
  }, []);

  return (
    <div className="flex flex-col bg-transparent gap-4 rounded-lg mb-4">
      {activityGroups.map((activityGroup, index) => (
        <div key={index} className="flex gap-5">
          <div className="activity-group-date flex flex-col text-center gap-1">
            <p className="leading-none text-xl font-semibold text-dark-blue-600">
              {formatAbbreviatedDate(activityGroup[0].attributes.createdAt).day}
            </p>
            <p className="leading-none text-xs font-regular text-gray-600">
              {
                formatAbbreviatedDate(activityGroup[0].attributes.createdAt)
                  .month
              }
            </p>
          </div>
          <div className="activity-group rounded-lg overflow-hidden divide-y border w-full">
            {activityGroup.map((activity, index) => (
              <div key={index} className="flex bg-white px-5 py-6 gap-5">
                <div className="relative">
                  <img
                    className="w-10 h-10 rounded-full"
                    src={ensureDomain(
                      activity.attributes.user.data.attributes.picture.data
                        .attributes.formats.thumbnail.url
                    )}
                    alt="something"
                  />
                  <span className="top-0 left-7 absolute  w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></span>
                </div>
                <div className="flex flex-col justify-center gap-2">
                  <p className="leading-none text-sm font-medium text-gray-900">
                    {`${activity.attributes.user.data.attributes.firstName} ${activity.attributes.user.data.attributes.lastName}`}
                    <span className="font-regular text-gray-500 ml-2">
                      {activity.attributes.message}
                    </span>
                  </p>
                  <p className="leading-none text-xs font-regular text-gray-400">
                    {formatDateToString(activity.attributes.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
