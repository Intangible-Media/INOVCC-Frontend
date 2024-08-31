import { Badge } from "flowbite-react";
import { CheckMark } from "../public/icons/intangible-icons";
import { Popover } from "flowbite-react";

export default function StructureStatusBadge({
  status,
  wpPassFail,
  adminStatus,
}) {
  console.log(wpPassFail);
  return (
    <div className="flex flex-col gap-1 w-[90px]">
      {status === "Inspected" && adminStatus === "Uploaded" && (
        <>
          <Badge
            icon={CheckMark}
            className="bg-dark-green text-xs h-fit text-white rounded-md px-2 py-0.5 flex-row-reverse "
          >
            {adminStatus}
          </Badge>
          <Badge className=" inline-block" color="green">
            {status}
          </Badge>
        </>
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

      {wpPassFail === "failed" && (
        <Badge className=" inline-block" color="red">
          Fail
        </Badge>
      )}

      {wpPassFail === "passed" && (
        <Badge className=" inline-block" color="green">
          Pass
        </Badge>
      )}
    </div>
  );
}
