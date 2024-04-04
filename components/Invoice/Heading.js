export default function InvoiceHeading() {
  return (
    <header className="mb-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex flex-col">
            <img
              src="/inovcc-logo.png"
              alt="Company Logo"
              className="h-12 mb-4"
            />
            <div>
              <p className="text-sm text-gray-600">This is something to test</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg text-gray-700 font-semibold">Invoice</p>
          <p className="text-sm text-gray-600">Invoice Number: #27998324</p>
          <p className="text-sm text-gray-600">Invoice Date: 2023-12-05</p>
          <p className="text-sm text-gray-600">Due Date: 2024-01-05</p>
        </div>
      </div>
      <div className="mt-4 border-t pt-4">
        <p className="text-sm text-gray-600">
          Address: 123 Business Road, City, Country
        </p>
        <p className="text-sm text-gray-600">
          Phone: (123) 456-7890 | Email: contact@example.com
        </p>
      </div>
    </header>
  );
}
