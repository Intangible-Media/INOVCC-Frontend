import StructureScheduledTag from "./StructureScheduledTag";
import { FaRegStar } from "react-icons/fa6";
import { getColorBasedOnStatus } from "../utils/strings";
import { structurePinStatus } from "../utils/collectionListAttributes";

export default function StructureNameTypeTag({ structure }) {
  const loadIcon = (color) => structurePinStatus[color] || "/location-red.png";

  return (
    <div className="flex w-full">
      <img
        src={loadIcon(getColorBasedOnStatus(structure.attributes.status))}
        style={{ height: 27 }}
      />
      <div className="flex flex-col justify-between pt-0 pb-0 pl-4 pr-4 leading-normal">
        <h5 className="flex flex-row flex-shrink-0 mb-1 text-sm font-bold tracking-tight text-dark0blue-700 dark:text-white cursor-pointer">
          <span className=" inline-block max-w-32 shorten-text mr-0">
            {structure.attributes.mapSection}
          </span>

          <span className="flex items-center font-light ml-1">
            {` / ${structure.attributes.type}`}
          </span>
          <span className="inline-block ml-1.5 mb-0.5">
            {structure.attributes.favorited && (
              <FaRegStar className="mt-1 text-dark-blue-700 w-4" />
            )}
          </span>
        </h5>
        <StructureScheduledTag structure={structure} />
      </div>
    </div>
  );
}
