import { useState, useEffect, useRef, useCallback } from "react";
import { Label, TextInput } from "flowbite-react";
import { useSession } from "next-auth/react";

import axios from "axios";
import qs from "qs";
import {
  ensureDomain,
  formatAbbreviatedDate,
  formatDateToString,
} from "../utils/strings";

export default function ActivityLog({
  id,
  collection,
  showDate = true,
  defaultExpanded = false,
}) {
  const [activityGroups, setActivityGroups] = useState([]);
  const { data: session } = useSession();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [page, setPage] = useState(1); // Keep track of the current page
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // State to track if there are more activities to load

  useEffect(() => {
    const fetchActivities = async () => {
      if (loading || !hasMore) return; // Prevent fetching if already loading or no more activities
      setLoading(true);

      const query = qs.stringify(
        {
          sort: ["createdAt:desc"],
          pagination: {
            page,
            pageSize: 15, // Adjust pageSize as needed
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

        const newData = response.data.data;

        setActivityGroups(
          flattenActivityGroups(activityGroups, groupByCreationDate(newData))
        );
        setHasMore(newData.length === 5); // Assume there are more to load if exactly 5 activities were returned
      } catch (error) {
        console.error("Failed to fetch activities", error);
      } finally {
        setLoading(false);
      }
    };

    if (isExpanded) {
      fetchActivities();
    }
  }, [session?.accessToken, id, collection, page, isExpanded]); // Add `page` and `isExpanded` to the dependency array

  // Define the function for the "Load More" button click
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prevPage) => prevPage + 1); // This will trigger the useEffect to load the next page of activities
    }
  };

  function flattenActivityGroups(array1, array2) {
    const combinedData = [...array1.flat(2), ...array2.flat(2)];
    return groupByCreationDate(combinedData);
  }

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
    <>
      {!defaultExpanded && (
        <div className="flex justify-between">
          {isExpanded && (
            <p
              className="text-gray-500 text-sm"
              onClick={() => setIsExpanded(false)}
            >
              Close Activity Log
            </p>
          )}

          {!isExpanded && (
            <p
              className="text-gray-500 text-sm"
              onClick={() => setIsExpanded(true)}
            >
              Open Activity Log
            </p>
          )}

          {isExpanded && (
            <div className="flex max-w-md gap-4">
              <Label className="hidden" htmlFor="activitySearch">
                Search Activities
              </Label>
              <TextInput
                type="text"
                id="activitySearch"
                placeholder="Search Activities"
                className="bg-white"
              />
            </div>
          )}
        </div>
      )}

      {isExpanded && (
        <div className="activity-log-container flex flex-col h-auto max-h-96 overflow-auto gap-5">
          {/* Render activity groups here */}
          {activityGroups.map((activityGroup, index) => (
            <div key={index} className="flex gap-5">
              {showDate && (
                <div className="activity-group-date flex flex-col text-center gap-1 sticky h-fit w-7">
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
                  <time className="text-xs font-medium text-gray-500 dark:text-white h-fit">
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
                        {activity.attributes.user.data.attributes.picture
                          .data && (
                          <img
                            className="w-10 h-10 rounded-full object-cover"
                            src={ensureDomain(
                              activity.attributes.user.data.attributes.picture
                                .data.attributes.formats.thumbnail.url
                            )}
                            alt="something"
                          />
                        )}
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
          {hasMore && !loading && (
            <button onClick={handleLoadMore}>Load More</button> // Button to load more activities
          )}
          {loading && <p>Loading...</p>}
        </div>
      )}
    </>
  );
}
