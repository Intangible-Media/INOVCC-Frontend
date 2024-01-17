"use client";

import { Select } from "flowbite-react";

export default function FooterDateExport() {
  return (
    <div className="flex items-center justify-between pt-6 mt-6 border-t">
      <Select>
        <option>Week</option>
        <option>Month</option>
        <option>Quarter</option>
        <option>Year</option>
      </Select>

      <div className="flex gap-2 items-center">
        <p className="font-semibold text-gray-600">Download Report</p>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 10 11"
          fill="none"
        >
          <path
            d="M3.89451 8.41665C3.78486 8.41662 3.67769 8.38244 3.58654 8.31842C3.49538 8.2544 3.42434 8.16341 3.38238 8.05697C3.34043 7.95053 3.32945 7.8334 3.35083 7.7204C3.37221 7.6074 3.425 7.5036 3.50252 7.42212L5.32829 5.50356L3.50252 3.585C3.44956 3.53126 3.40732 3.46697 3.37827 3.39589C3.34921 3.3248 3.33391 3.24835 3.33327 3.17099C3.33263 3.09363 3.34666 3.01691 3.37454 2.94531C3.40242 2.87371 3.44359 2.80866 3.49564 2.75396C3.5477 2.69925 3.60961 2.65599 3.67774 2.6267C3.74588 2.5974 3.81889 2.58266 3.89251 2.58333C3.96613 2.58401 4.03888 2.60008 4.10653 2.63061C4.17417 2.66115 4.23535 2.70553 4.28649 2.76118L6.50425 5.09165C6.60819 5.20091 6.66659 5.34907 6.66659 5.50356C6.66659 5.65805 6.60819 5.80621 6.50425 5.91547L4.28649 8.24594C4.18254 8.35521 4.04154 8.41661 3.89451 8.41665Z"
            fill="#4B5563"
          />
        </svg>
      </div>
    </div>
  );
}
