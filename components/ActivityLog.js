import { Avatar } from "flowbite-react";

export default function ActivityLog() {
  const activities = [
    {
      date: "Dec 14",
      time: "11:00am",
      action: "Updated “Map Name 1234.89” to Completed",
    },
    {
      date: "Dec 14",
      time: "11:30am",
      action: "Updated “Map Nfdsfdsfdsfdsfame 1234.89” to Completed",
    },
  ];

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {activities.map((activity, idx) => (
          <li key={idx}>
            <div className="flex items-center px-4 py-4 sm:px-6">
              <div className="min-w-0 flex-1 flex items-center">
                <Avatar
                  img="https://flowbite.com/docs/images/people/profile-picture-3.jpg"
                  rounded={true}
                />
                <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                  <div>
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      Allie Smith
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500">
                      <span className="truncate">{activity.action}</span>
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <div>
                      <p className="text-sm text-gray-900">{activity.date}</p>
                      <p className="mt-2 flex items-center text-sm text-gray-500">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
