import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";

import axios from "axios";
import qs from "qs";
import { ensureDomain } from "../utils/strings";

export default function ActivityLog({ id, collection, showDate = true }) {
  const [activityGroups, setActivityGroups] = useState([]);
  const { data: session } = useSession();
  const [isExpanded, setIsExpanded] = useState(false);
  const activityLogRef = useRef(null); // Added ref here
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      if (loading) return;
      setLoading(true);

      const query = qs.stringify(
        {
          sort: ["createdAt:desc"],
          pagination: {
            pageSize: 5,
          },
          populate: {
            user: {
              populate: {
                picture: "*",
              },
              fields: ["firstName", "lastName"],
            },
          },
          filters: {
            collection: { $eq: collection },
            collectionId: { $eq: id },
          },
        },
        { encodeValuesOnly: true }
      );

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/activities?${query}`,
          {
            headers: {
              Authorization: `Bearer ${session?.accessToken}`,
            },
          }
        );

        const newData = groupByCreationDate(response.data.data);
        setActivityGroups(newData);
      } catch (error) {
        console.error("Failed to fetch activities", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [session?.accessToken, id, collection]);

  useEffect(() => {
    if (!isExpanded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            console.log("Scrolled to the bottom of the activity log");
            // Optionally: Check if there's more content to load and load it here
          }
        });
      },
      {
        root: null, // observing for viewport
        rootMargin: "0px",
        threshold: 1.0, // Trigger when 100% of the observed element is in the viewport
      }
    );

    const div = activityLogRef.current;
    if (div) {
      // Observe the last element in your activity log for intersection
      observer.observe(div.lastElementChild);
    }

    return () => {
      if (div) {
        observer.disconnect();
      }
    };
  }, [isExpanded]);

  function groupByCreationDate(data) {
    const groups = {};
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    data.forEach((item) => {
      if (typeof item.attributes.createdAt !== "string") {
        console.error("Invalid createdAt value:", item.attributes.createdAt);
        return; // Skip this item
      }

      const timezone = userTimeZone || "UTC";
      const options = {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      };
      const formatter = new Intl.DateTimeFormat("en-US", options);

      const formattedDate = formatter.format(
        new Date(item.attributes.createdAt)
      );
      const [month, day, year] = formattedDate.split("/");
      const adjustedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
        2,
        "0"
      )}`;

      if (!groups[adjustedDate]) {
        groups[adjustedDate] = [];
      }

      groups[adjustedDate].push(item);
    });

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

  function formatDateToString(dateString, includeTime = true) {
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

    let dateStringFormatted = `${month} ${day}, ${year}`;

    if (includeTime) {
      // Formatting time
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "pm" : "am";

      hours = hours % 12;
      hours = hours ? hours : 12; // Convert '0' hours to '12'
      const minutesStr = minutes < 10 ? "0" + minutes : minutes;

      const time = `${hours}:${minutesStr}${ampm}`;
      dateStringFormatted += ` / ${time}`;
    }

    return dateStringFormatted;
  }

  function BoldQuotesMessage({ message }) {
    // This regex matches segments inside quotes and outside quotes
    const regex = /"([^"]*)"|([^"]+)/g;
    const parts = [];

    let match;
    while ((match = regex.exec(message)) !== null) {
      // match[1] will contain the quoted text (excluding quotes), if present
      // match[2] will contain the non-quoted text, if present
      if (match[1]) {
        // Text was inside quotes, bold it
        parts.push(
          <span key={match.index} className="font-medium text-dark-blue-600">
            {match[1]}
          </span>
        );
      } else if (match[2]) {
        // Normal text, don't bold
        parts.push(match[2]);
      }
    }

    return parts;
  }

  return (
    <div>
      {isExpanded ? (
        <p
          className="text-gray-500 text-xs py-4"
          onClick={() => setIsExpanded(false)}
        >
          Close Activity Log
        </p>
      ) : (
        <p
          className="text-gray-500 text-xs py-4"
          onClick={() => setIsExpanded(true)}
        >
          Open Activity Log
        </p>
      )}

      {isExpanded && (
        <div
          ref={activityLogRef}
          className="flex flex-col bg-transparent gap-4 rounded-lg mb-4 border-t pt-4 h-auto max-h-96 overflow-auto"
        >
          {activityGroups.map((activityGroup, index) => (
            <div key={index} className="flex gap-5">
              {showDate && (
                <div className="activity-group-date flex flex-col text-center gap-1 sticky h-fit">
                  <p className="leading-none text-xl font-semibold text-dark-blue-600">
                    {
                      formatAbbreviatedDate(
                        activityGroup[0].attributes.createdAt
                      ).day
                    }
                  </p>
                  <p className="leading-none text-xs font-regular text-gray-600">
                    {
                      formatAbbreviatedDate(
                        activityGroup[0].attributes.createdAt
                      ).month
                    }
                  </p>
                </div>
              )}
              <div className="flex flex-col gap-2 w-full">
                {!showDate && (
                  <time className="text-xs font-medium text-gray-500 dark:text-white">
                    {`${formatDateToString(
                      activityGroup[0].attributes.createdAt,
                      false
                    )} `}
                  </time>
                )}
                <div className="activity-group rounded-lg overflow-hidden divide-y border w-full">
                  {activityGroup.map((activity, index) => (
                    <div key={index} className="flex bg-white px-5 py-6 gap-5">
                      <div className="relative w-10 h-10 flex-shrink-0">
                        <img
                          className="w-10 h-10 rounded-full object-cover"
                          src={ensureDomain(
                            activity.attributes.user.data.attributes.picture
                              .data.attributes.formats.thumbnail.url
                          )}
                          alt="something"
                        />
                        <span className="top-0 left-7 absolute  w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></span>
                      </div>
                      <div className="flex flex-col justify-center gap-2">
                        <p className="text-sm leading-4 font-medium text-gray-900 text-he">
                          <span className="font-semibold">
                            {" "}
                            {`${activity.attributes.user.data.attributes.firstName} ${activity.attributes.user.data.attributes.lastName}`}
                          </span>
                          <span className="font-regular text-gray-500 ml-2">
                            <BoldQuotesMessage
                              message={activity.attributes.message}
                            />
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
            </div>
          ))}
          {loading && <p>Loading more activities...</p>}
        </div>
      )}
    </div>
  );
}
