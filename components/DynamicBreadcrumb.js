"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { HiHome } from "react-icons/hi";
import { Breadcrumb } from "flowbite-react";
import { camelCaseToTitleCase } from "../utils/strings";

function DynamicBreadcrumb() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [breadcrumbPath, setBreadcrumbPath] = useState([]);

  useEffect(() => {
    const url = `${pathname}?${searchParams}`;
    setBreadcrumbPath(pathname.split("/").slice(1));
  }, [pathname, searchParams]);

  const breadcrumbItems = breadcrumbPath.map((segment, index) => {
    return (
      <Breadcrumb.Item key={index} href="/" className=" text-xs md:text-sm">
        {camelCaseToTitleCase(segment)}
      </Breadcrumb.Item>
    );
  });

  return (
    <Breadcrumb
      className="dark-text p-2.5 md:p-5 border-b border-gray-300"
      aria-label="Breadcrumb"
    >
      <Breadcrumb.Item href="/" icon={HiHome} className=" text-xs md:text-sm">
        Home
      </Breadcrumb.Item>
      {breadcrumbItems}
    </Breadcrumb>
  );
}

export default DynamicBreadcrumb;
