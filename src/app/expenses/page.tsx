"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMoneyBillWave,
  FaPlus,
  FaTrashAlt,
  FaPrint,
  FaSearch,
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";

interface Expense {
  id: number;
  category: string;
  amount: number;
  description: string;
  date: string;
  status: "Approved" | "Pending";
}

export default function ExpensesPage() {
  const [showForm, setShowForm] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: 1,
      category: "Office Supplies",
      amount: 2500,
      description: "Printer Ink and Papers",
      date: "2025-11-01",
      status: "Approved",
    },
    {
      id: 2,
      category: "Travel",
      amount: 4200,
      description: "Client meeting transport",
      date: "2025-11-03",
      status: "Pending",
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const expensesPerPage = 5;
  const indexOfLast = currentPage * expensesPerPage;
  const indexOfFirst = indexOfLast - expensesPerPage;
  const currentExpenses = expenses.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(expenses.length / expensesPerPage);

  const handleAddExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const newExpense: Expense = {
      id: Date.now(),
      category: data.get("category") as string,
      amount: parseFloat(data.get("amount") as string),
      description: data.get("description") as string,
      date: data.get("date") as string,
      status: data.get("status") as "Approved" | "Pending",
    };
    setExpenses([...expenses, newExpense]);
    setShowForm(false);
    e.currentTarget.reset();
    alert("Expense added successfully!");
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure to delete this expense?")) {
      setExpenses(expenses.filter((exp) => exp.id !== id));
    }
  };

  const handlePrintAll = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-slate-200 p-6">
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
            <h1 className="text-2xl font-bold text-gray-800">
              Expense Management
            </h1>
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
              <FaPlus /> Add Expense
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by category or description..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm md:text-base border-collapse">
            <thead>
              <tr className="bg-indigo-600 text-white">
                <th className="py-3 px-4 text-left rounded-tl-lg">Category</th>
                <th className="py-3 px-4 text-left">Amount</th>
                <th className="py-3 px-4 text-left">Description</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-center rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentExpenses.map((expense) => (
                <tr
                  key={expense.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {expense.category}
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-800">
                    ₹{expense.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">{expense.description}</td>
                  <td className="py-3 px-4">{expense.date}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold w-fit ${
                        expense.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {expense.status === "Approved" ? (
                        <FaCheckCircle />
                      ) : (
                        <FaClock />
                      )}
                      {expense.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
                      title="Delete Expense"
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

      {/* Add Expense Modal */}
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
                Add New Expense
              </h2>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <input
                  name="category"
                  placeholder="Expense Category"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                <input
                  name="amount"
                  type="number"
                  placeholder="Amount (₹)"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                <textarea
                  name="description"
                  placeholder="Description"
                  rows={3}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                <input
                  name="date"
                  type="date"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                <select
                  name="status"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                </select>

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
                    Save Expense
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
