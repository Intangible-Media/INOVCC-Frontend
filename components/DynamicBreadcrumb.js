"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { HiHome } from "react-icons/hi";
import { Breadcrumb } from "flowbite-react";
import { camelCaseToTitleCase } from "../utils/strings";
import Link from "next/link";

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
      <Breadcrumb.Item key={index} className=" text-xs md:text-sm">
        <Link href={`/${segment}`}>{camelCaseToTitleCase(segment)}</Link>
      </Breadcrumb.Item>
    );
  });

  return (
    <Breadcrumb
      className="dark-text p-2.5 md:p-5 border-b border-gray-300"
      aria-label="Breadcrumb"
    >
      <Breadcrumb.Item icon={HiHome} className=" text-xs md:text-sm">
        <Link href="/">Home</Link>
      </Breadcrumb.Item>
      {breadcrumbItems}
    </Breadcrumb>
  );
}

export default DynamicBreadcrumb;
