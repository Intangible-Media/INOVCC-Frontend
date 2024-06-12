export default function StructureTypesNumbers({ structures }) {
  const separateByType = (data) => {
    const typeMap = new Map();

    data.forEach((item) => {
      const type = item.attributes.type;
      if (!typeMap.has(type)) {
        typeMap.set(type, 0);
      }
      typeMap.set(type, typeMap.get(type) + 1);
    });

    return Array.from(typeMap, ([name, count]) => ({ name, count }));
  };

  const sortedStructures = separateByType(structures);

  return (
    <div className="shadow-sm bg-white gap-4 p-4 md:p-6 rounded-lg w-full h-fit flex justify-around">
      {sortedStructures.map((structuresGroup, index) => (
        <div>
          <p className="mb-2 text-3xl font-extrabold md:text-4xl text-center">
            {structuresGroup.count}
          </p>
          <p className="font-light text-gray-500 dark:text-gray-400 text-center">
            {structuresGroup.name}
          </p>
        </div>
      ))}
    </div>
  );
}
