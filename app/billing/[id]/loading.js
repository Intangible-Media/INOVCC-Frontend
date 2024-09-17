import InvoiceHeading from "../../../components/Invoice/Heading";

export default function Page({ params }) {
  return (
    <div className="grid grid-cols-6 gap-4 my-6">
      <div className="flex flex-col col-span-4 border-gray-300 dark:border-gray-600 bg-white gap-4">
        <div className="invoice-viewer overflow-x-auto shadow-md">
          <InvoiceHeading />

          <section className="mb-10">
            <p className="text-lg text-gray-700 font-semibold">Bill To:</p>
            <p className="text-sm text-gray-600">Something</p>
            <p className="text-sm text-gray-600">Something</p>
          </section>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 col-span-2 h-fit-content px-6 py-8 bg-white rounded-lg shadow"></div>
    </div>
  );
}
