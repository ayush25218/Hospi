"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMoneyBillWave,
  FaPlus,
  FaTrashAlt,
  FaPrint,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";

interface Payment {
  id: number;
  paymentId: string;
  payerName: string;
  date: string;
  amount: number;
  method: string;
  status: "Success" | "Pending" | "Failed";
}

export default function PaymentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 5;

  // Dummy Data
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: 1,
      paymentId: "PAY-101",
      payerName: "Aarav Sharma",
      date: "2025-11-01",
      amount: 5000,
      method: "UPI",
      status: "Success",
    },
    {
      id: 2,
      paymentId: "PAY-102",
      payerName: "Riya Singh",
      date: "2025-11-02",
      amount: 2500,
      method: "Credit Card",
      status: "Pending",
    },
    {
      id: 3,
      paymentId: "PAY-103",
      payerName: "Vikram Mehra",
      date: "2025-11-03",
      amount: 3000,
      method: "Cash",
      status: "Success",
    },
    {
      id: 4,
      paymentId: "PAY-104",
      payerName: "Amit Verma",
      date: "2025-11-04",
      amount: 4500,
      method: "Debit Card",
      status: "Failed",
    },
  ]);

  // Pagination logic
  const indexOfLast = currentPage * paymentsPerPage;
  const indexOfFirst = indexOfLast - paymentsPerPage;
  const currentPayments = payments.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(payments.length / paymentsPerPage);

  const handleAddPayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const newPayment: Payment = {
      id: Date.now(),
      paymentId: `PAY-${Date.now()}`,
      payerName: data.get("payerName") as string,
      date: data.get("date") as string,
      amount: parseFloat(data.get("amount") as string),
      method: data.get("method") as string,
      status: "Success",
    };
    setPayments([...payments, newPayment]);
    setShowForm(false);
    form.reset();
    alert("Payment added successfully!");
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure to delete this payment?")) {
      setPayments(payments.filter((p) => p.id !== id));
    }
  };

  const handlePrintAll = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 to-gray-200 p-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-xl"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <FaMoneyBillWave className="text-indigo-600 text-3xl" />
            <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handlePrintAll}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <FaPrint /> Print All
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <FaPlus /> Add Payment
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by payer name or ID..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm md:text-base border-collapse">
            <thead>
              <tr className="bg-indigo-600 text-white">
                <th className="py-3 px-4 text-left rounded-tl-lg">Payment ID</th>
                <th className="py-3 px-4 text-left">Payer Name</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Amount</th>
                <th className="py-3 px-4 text-left">Method</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-center rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentPayments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {payment.paymentId}
                  </td>
                  <td className="py-3 px-4">{payment.payerName}</td>
                  <td className="py-3 px-4">{payment.date}</td>
                  <td className="py-3 px-4 font-semibold text-gray-800">
                    ₹{payment.amount}
                  </td>
                  <td className="py-3 px-4">{payment.method}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold w-fit ${
                        payment.status === "Success"
                          ? "bg-green-100 text-green-700"
                          : payment.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {payment.status === "Success" && <FaCheckCircle />}
                      {payment.status === "Pending" && <FaClock />}
                      {payment.status === "Failed" && <FaTimesCircle />}
                      {payment.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleDelete(payment.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
                      title="Delete Payment"
                    >
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
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

      {/* Add Payment Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Add New Payment
              </h2>
              <form onSubmit={handleAddPayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Payer Name
                  </label>
                  <input
                    name="payerName"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Amount (₹)
                  </label>
                  <input
                    name="amount"
                    type="number"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Date
                  </label>
                  <input
                    name="date"
                    type="date"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Method
                  </label>
                  <select
                    name="method"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select Method</option>
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Net Banking">Net Banking</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Save Payment
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
