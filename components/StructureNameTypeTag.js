import StructureScheduledTag from "./StructureScheduledTag";
import { FaRegStar } from "react-icons/fa6";
import { getColorBasedOnStatus } from "../utils/strings";
import { structurePinStatus } from "../utils/collectionListAttributes";

export default function StructureNameTypeTag({ structure }) {
  const loadIcon = (color) => structurePinStatus[color] || "/location-red.png";

  return (
    <div className="flex">
      <img
        src={loadIcon(getColorBasedOnStatus(structure.attributes.status))}
        style={{ height: 27 }}
      />
      <div className="flex flex-col justify-between pt-0 pb-0 pl-4 pr-4 leading-normal">
        <h5 className="flex flex-col md:flex-row flex-shrink-0 mb-1 text-sm font-bold tracking-tight text-dark0blue-700 dark:text-white cursor-pointer">
          <span className="flex shorten-text">
            {structure.attributes.mapSection}
            {structure.attributes.favorited && (
              <FaRegStar className="text-dark-blue-700 w-5 ml-1 mt-0.5" />
            )}
          </span>
          <span className="flex items-center font-light ml-1">
            {`${structure.attributes.type}`}
          </span>
        </h5>
        <StructureScheduledTag structure={structure} />
      </div>
    </div>
  );
}
