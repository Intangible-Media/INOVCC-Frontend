import Image from "next/image";

export default async function LateTasksList({ users }) {
  return (
    <div className="flow-root h-72 overflow-auto">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {users.map((user, index) => (
          <li key={index} className="py-3 sm:py-4">
            <div className="flex items-center space-x-4">
              <div className="shrink-0">
                <Image
                  alt="Neil image"
                  height="32"
                  src="https://flowbite-react.com/images/people/profile-picture-5.jpg"
                  width="32"
                  className="rounded-full"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {`${user.firstName} ${user.lastName}`}
                </p>
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
              <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                {user.tasks.length}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
