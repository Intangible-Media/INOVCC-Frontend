"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { HiHome } from "react-icons/hi";
import { Breadcrumb } from "flowbite-react";

function DynamicBreadcrumb() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [breadcrumbPath, setBreadcrumbPath] = useState([]);

  useEffect(() => {
    const url = `${pathname}?${searchParams}`;
    console.log(url);
    console.log(pathname.split("/"));
    setBreadcrumbPath(pathname.split("/").slice(1));
  }, [pathname, searchParams]);

  const breadcrumbItems = breadcrumbPath.map((segment, index) => {
    return (
      <Breadcrumb.Item key={index} href="/">
        {segment}
      </Breadcrumb.Item>
    );
  });

  return (
    <Breadcrumb className="dark-text" aria-label="Breadcrumb">
      <Breadcrumb.Item href="/" icon={HiHome}>
        Home
      </Breadcrumb.Item>
      {breadcrumbItems}
    </Breadcrumb>
  );
}

export default DynamicBreadcrumb;
