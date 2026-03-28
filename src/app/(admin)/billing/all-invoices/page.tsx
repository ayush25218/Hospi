"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  FaEye,
  FaPrint,
  FaTrashAlt,
  FaFileInvoice,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";

interface Invoice {
  id: number;
  invoiceNumber: string;
  customerName: string;
  date: string;
  totalAmount: number;
  status: string;
}

const AllInvoiceList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const invoicesPerPage = 5;
  const printRef = useRef<HTMLDivElement>(null);

  // Demo data
  const invoices: Invoice[] = [
    {
      id: 1,
      invoiceNumber: "INV-1001",
      customerName: "Rahul Sharma",
      date: "2025-11-01",
      totalAmount: 4500,
      status: "Paid",
    },
    {
      id: 2,
      invoiceNumber: "INV-1002",
      customerName: "Sushant Kumar",
      date: "2025-11-02",
      totalAmount: 3100,
      status: "Pending",
    },
    {
      id: 3,
      invoiceNumber: "INV-1003",
      customerName: "Neha Gupta",
      date: "2025-11-03",
      totalAmount: 8700,
      status: "Paid",
    },
    {
      id: 4,
      invoiceNumber: "INV-1004",
      customerName: "Ravi Singh",
      date: "2025-11-04",
      totalAmount: 1250,
      status: "Cancelled",
    },
    {
      id: 5,
      invoiceNumber: "INV-1005",
      customerName: "Amit Verma",
      date: "2025-11-05",
      totalAmount: 6400,
      status: "Paid",
    },
    {
      id: 6,
      invoiceNumber: "INV-1006",
      customerName: "Priya Das",
      date: "2025-11-06",
      totalAmount: 5100,
      status: "Pending",
    },
  ];

  const indexOfLast = currentPage * invoicesPerPage;
  const indexOfFirst = indexOfLast - invoicesPerPage;
  const currentInvoices = invoices.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(invoices.length / invoicesPerPage);

  // Handlers
  const handlePrint = (invoice: Invoice) => {
    alert(`Printing invoice: ${invoice.invoiceNumber}`);
    window.print();
  };

  const handleView = (invoice: Invoice) => {
    alert(`Viewing details of ${invoice.invoiceNumber}`);
  };

  const handleDelete = (invoice: Invoice) => {
    if (confirm(`Delete ${invoice.invoiceNumber}?`)) {
      alert(`${invoice.invoiceNumber} deleted successfully!`);
    }
  };

  const handlePrintAll = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 to-gray-200 p-6">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FaFileInvoice className="text-indigo-600 text-3xl" />
            <h1 className="text-2xl font-bold text-gray-800">
              All Invoices List
            </h1>
          </div>

          {/* Print All Button */}
          <button
            onClick={handlePrintAll}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
          >
            <FaPrint /> Print All Invoices
          </button>
        </div>

        {/* Table */}
        <div ref={printRef} className="overflow-x-auto">
          <table className="w-full border-collapse text-sm md:text-base">
            <thead>
              <tr className="bg-indigo-600 text-white">
                <th className="py-3 px-4 text-left rounded-tl-xl">Invoice #</th>
                <th className="py-3 px-4 text-left">Customer</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Amount</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-center rounded-tr-xl">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentInvoices.map((invoice) => (
                <motion.tr
                  key={invoice.id}
                  whileHover={{ scale: 1.01 }}
                  className="border-b hover:bg-gray-50 transition-all"
                >
                  <td className="py-3 px-4 font-medium text-gray-700">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {invoice.customerName}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{invoice.date}</td>
                  <td className="py-3 px-4 font-semibold text-gray-800">
                    ₹{invoice.totalAmount}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        invoice.status === "Paid"
                          ? "bg-green-100 text-green-700"
                          : invoice.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleView(invoice)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition"
                        title="View Invoice"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handlePrint(invoice)}
                        className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition"
                        title="Print Invoice"
                      >
                        <FaPrint />
                      </button>
                      <button
                        onClick={() => handleDelete(invoice)}
                        className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
                        title="Delete Invoice"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6 print:hidden">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
            }`}
          >
            <FaArrowLeft /> Prev
          </button>

          <span className="text-gray-700 font-medium">
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
            }`}
          >
            Next <FaArrowRight />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AllInvoiceList;
