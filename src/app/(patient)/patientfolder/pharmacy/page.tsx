'use client';

import React, { useState } from 'react';
import { FaSearch, FaFileExcel, FaFilePdf, FaFileCsv, FaPrint, FaMoneyBillWave, FaList } from 'react-icons/fa';

const PharmacyBillPage = () => {
  const [search, setSearch] = useState('');

  const bills = [
    { billNo: 'PHARMAB522', caseId: 115, date: '11/25/2025 08:00 PM', doctor: 'Reyan Jain (9011)', note: '', discount: '58.50 (10.00%)', net: 577.13, paid: 410.00, refund: 0.00, balance: 167.13 },
    { billNo: 'PHARMAB517', caseId: 115, date: '11/01/2025 04:37 PM', doctor: 'Reyan Jain (9011)', note: '', discount: '39.15 (10.00%)', net: 396.70, paid: 470.00, refund: 73.30, balance: 0.00 },
    { billNo: 'PHARMAB515', caseId: 115, date: '10/30/2025 03:00 PM', doctor: 'Sansa Gomez (9008)', note: '', discount: '66.94 (12.00%)', net: 555.67, paid: 462.00, refund: 0.00, balance: 93.67 },
    { billNo: 'PHARMAB509', caseId: 115, date: '10/01/2025 04:19 PM', doctor: 'Sansa Gomez (9008)', note: '', discount: '43.20 (12.00%)', net: 332.64, paid: 300.00, refund: 0.00, balance: 32.64 },
    { billNo: 'PHARMAB504', caseId: 7332, date: '09/15/2025 01:30 PM', doctor: 'Sansa Gomez (9008)', note: '', discount: '42.55 (10.00%)', net: 436.43, paid: 436.43, refund: 0.00, balance: 0.00 },
    { billNo: 'PHARMAB501', caseId: 115, date: '09/01/2025 12:00 PM', doctor: 'Reyan Jain (9011)', note: '', discount: '0.00 (0.00%)', net: 355.27, paid: 397.80, refund: 42.53, balance: 0.00 },
    { billNo: 'PHARMAB494', caseId: 115, date: '08/10/2025 04:51 PM', doctor: 'Sansa Gomez (9008)', note: '', discount: '30.28 (10.00%)', net: 307.06, paid: 418.84, refund: 111.78, balance: 0.00 },
    { billNo: 'PHARMAB486', caseId: 115, date: '07/15/2025 03:03 PM', doctor: 'Reyan Jain (9011)', note: '', discount: '22.80 (10.00%)', net: 171.07, paid: 171.07, refund: 0.00, balance: 0.00 },
    { billNo: 'PHARMAB483', caseId: 115, date: '06/30/2025 10:30 PM', doctor: 'Sonia Bush (9002)', note: '', discount: '54.60 (12.00%)', net: 420.42, paid: 320.00, refund: 0.00, balance: 100.42 },
    { billNo: 'PHARMAB477', caseId: 115, date: '06/01/2025 04:49 PM', doctor: 'Sansa Gomez (9008)', note: '', discount: '27.50 (10.00%)', net: 259.88, paid: 200.00, refund: 0.00, balance: 59.88 },
  ];

  const filteredBills = bills.filter((bill) =>
    bill.billNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="bg-white shadow rounded-lg p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Pharmacy Bill</h2>
          <div className="flex items-center gap-3 text-gray-600">
            <FaFileExcel className="cursor-pointer hover:text-green-600" title="Export Excel" />
            <FaFilePdf className="cursor-pointer hover:text-red-600" title="Export PDF" />
            <FaFileCsv className="cursor-pointer hover:text-blue-600" title="Export CSV" />
            <FaPrint className="cursor-pointer hover:text-gray-800" title="Print" />
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-3 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-200 text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-3 py-2 border">Bill No</th>
                <th className="px-3 py-2 border">Case ID</th>
                <th className="px-3 py-2 border">Date</th>
                <th className="px-3 py-2 border">Doctor Name</th>
                <th className="px-3 py-2 border">Note</th>
                <th className="px-3 py-2 border">Discount ($)</th>
                <th className="px-3 py-2 border">Net Amount ($)</th>
                <th className="px-3 py-2 border">Paid Amount ($)</th>
                <th className="px-3 py-2 border">Refund Amount ($)</th>
                <th className="px-3 py-2 border">Balance Amount ($)</th>
                <th className="px-3 py-2 border text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.map((bill, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{bill.billNo}</td>
                  <td className="border px-3 py-2">{bill.caseId}</td>
                  <td className="border px-3 py-2">{bill.date}</td>
                  <td className="border px-3 py-2">{bill.doctor}</td>
                  <td className="border px-3 py-2">{bill.note}</td>
                  <td className="border px-3 py-2 text-right">{bill.discount}</td>
                  <td className="border px-3 py-2 text-right">{bill.net.toFixed(2)}</td>
                  <td className="border px-3 py-2 text-right">{bill.paid.toFixed(2)}</td>
                  <td className="border px-3 py-2 text-right">{bill.refund.toFixed(2)}</td>
                  <td className="border px-3 py-2 text-right">{bill.balance.toFixed(2)}</td>
                  <td className="border px-3 py-2 text-center">
                    <div className="flex justify-center gap-2">
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs">
                        Pay
                      </button>
                      <FaList className="text-gray-600 cursor-pointer hover:text-black" />
                      <FaMoneyBillWave className="text-green-500 cursor-pointer hover:text-green-700" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center text-sm text-gray-500 mt-3">
          <p>Records: 1 to {filteredBills.length} of {bills.length}</p>
          <div className="flex gap-2">
            <button className="border px-2 py-1 rounded text-gray-600 hover:bg-gray-100">&lt;</button>
            <button className="border px-2 py-1 rounded bg-blue-500 text-white">1</button>
            <button className="border px-2 py-1 rounded text-gray-600 hover:bg-gray-100">2</button>
            <button className="border px-2 py-1 rounded text-gray-600 hover:bg-gray-100">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyBillPage;
