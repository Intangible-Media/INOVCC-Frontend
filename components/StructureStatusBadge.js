import { Badge } from "flowbite-react";
import { CheckMark } from "../public/icons/intangible-icons";

export default function StructureStatusBadge({ status, adminStatus }) {
  return (
    <>
      {status === "Inspected" && adminStatus === "Uploaded" && (
        <div className="inline-block">
          <Badge
            icon={CheckMark}
            className="bg-dark-green text-xs h-fit text-white rounded-md px-2 py-0.5 flex-row-reverse "
          >
            {adminStatus}
          </Badge>
        </div>
      )}

      {status === "Inspected" && adminStatus !== "Uploaded" && (
        <Badge className=" inline-block" color="green">
          {status}
        </Badge>
      )}

      {status !== "Inspected" && (
        <Badge className=" inline-block" color="yellow">
          {status}
        </Badge>
      )}
    </>
  );
}
