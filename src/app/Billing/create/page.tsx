'use client'; // Tabs, dynamic forms, aur state ke liye zaroori hai

import { useState, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  LuFilePlus,
  LuList,
  LuUser,
  LuStethoscope,
  LuUsers,
  LuDollarSign,
  LuCalendar,
  LuPlus,
  LuTrash2,
  LuSave,
  LuFileText,
  LuInfo,
} from 'react-icons/lu';

// --- Types ---
type InvoiceFor = 'patient' | 'staff' | 'doctor';
type LineItem = {
  id: number;
  description: string;
  quantity: number;
  price: number;
};
type Status = 'Draft' | 'Pending' | 'Paid' | 'Cancelled';

// --- Dummy Data (Dropdowns ke liye) ---
const dummyPatients = [
  { id: 'PID-001', name: 'Aarav Sharma' },
  { id: 'PID-002', name: 'Riya Singh' },
  { id: 'PID-003', name: 'Vikram Mehra' },
];
const dummyStaff = [
  { id: 'SID-001', name: 'Rohan Verma (Nurse)' },
  { id: 'SID-002', name: 'Aisha Khan (Receptionist)' },
  { id: 'DOC-001', name: 'Dr. Priya Gupta (Cardiology)' },
];

/**
 * ==========================================
 * Main Create Invoice Page Component
 * ==========================================
 */
export default function CreateInvoicePage() {
  const [invoiceFor, setInvoiceFor] = useState<InvoiceFor>('patient');

  return (
    <div className="space-y-8">
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LuFilePlus className="h-8 w-8 text-indigo-700" />
          <h1 className="text-3xl font-bold text-gray-900">Create New Invoice</h1>
        </div>
        <Link
          href="/billing"
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg
                     hover:bg-gray-700 transition-colors w-full md:w-auto justify-center"
        >
          <LuList className="w-5 h-5" />
          All Invoices
        </Link>
      </div>

      {/* --- Invoice Type Tabs --- */}
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          1. Select Invoice Type
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-1 bg-gray-100 rounded-lg">
          <TabButton
            label="Patient Bill"
            icon={LuUser}
            isActive={invoiceFor === 'patient'}
            onClick={() => setInvoiceFor('patient')}
          />
          <TabButton
            label="Doctor Paystub"
            icon={LuStethoscope}
            isActive={invoiceFor === 'doctor'}
            onClick={() => setInvoiceFor('doctor')}
          />
          <TabButton
            label="Staff Paystub"
            icon={LuUsers}
            isActive={invoiceFor === 'staff'}
            onClick={() => setInvoiceFor('staff')}
          />
        </div>
      </div>

      {/* --- Dynamic Form --- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={invoiceFor}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {invoiceFor === 'patient' ? (
            <PatientInvoiceForm />
          ) : (
            <StaffInvoiceForm type={invoiceFor} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/**
 * ==========================================
 * Helper: Tab Button Component
 * ==========================================
 */
const TabButton = ({ label, icon: Icon, isActive, onClick }: {
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium rounded-md transition-all
      ${
        isActive
          ? 'bg-white text-indigo-700 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
      }`}
  >
    <Icon className="w-5 h-5" />
    <span className="font-semibold">{label}</span>
  </button>
);

/**
 * ==========================================
 * Helper: Patient Invoice Form
 * ==========================================
 */
const PatientInvoiceForm = () => {
  const [items, setItems] = useState<LineItem[]>([
    { id: 1, description: 'Consultation Fee', quantity: 1, price: 500 },
  ]);
  const [status, setStatus] = useState<Status>('Pending');
  const [tax, setTax] = useState(5); // 5%
  const [discount, setDiscount] = useState(0);

  // Totals Calculation
  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const taxAmount = (subtotal - discount) * (tax / 100);
  const grandTotal = subtotal - discount + taxAmount;

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now(), description: '', quantity: 1, price: 0 },
    ]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (
    id: number,
    field: keyof LineItem,
    value: string | number
  ) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Patient Invoice Data:", { items, status, subtotal, taxAmount, grandTotal });
    alert('Patient invoice created! (Check console for data)');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">2. Bill To Patient</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Patient Select */}
        <InputGroup
          label="Patient Name" name="patientId" type="select" icon={LuUser}
          value="" onChange={() => {}}
        >
          <option value="">Select a Patient</option>
          {dummyPatients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </InputGroup>
        
        {/* Invoice Date */}
        <InputGroup
          label="Invoice Date" name="invoiceDate" type="date" icon={LuCalendar}
          value={new Date().toISOString().split('T')[0]} onChange={() => {}}
        />

        {/* Status */}
        <InputGroup
          label="Status" name="status" type="select" icon={LuInfo}
          value={status} onChange={(e) => setStatus(e.target.value as Status)}
        >
          <option value="Draft">Draft</option>
          <option value="Pending">Pending (Awaiting Payment)</option>
          <option value="Paid">Paid</option>
          <option value="Cancelled">Cancelled</option>
        </InputGroup>
      </div>

      {/* --- Line Items --- */}
      <h4 className="text-lg font-semibold text-gray-700 pt-4 border-t">Services & Items</h4>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
            <input
              type="text" placeholder="Item Description"
              value={item.description}
              onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
              className="col-span-5 py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="number" placeholder="Qty"
              value={item.quantity}
              onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
              className="col-span-2 py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="number" placeholder="Price"
              value={item.price}
              onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value) || 0)}
              className="col-span-3 py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <span className="col-span-1 text-right font-medium">
              {(item.quantity * item.price).toFixed(2)}
            </span>
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="col-span-1 text-red-500 hover:text-red-700"
            >
              <LuTrash2 className="w-5 h-5 mx-auto" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg
                   hover:bg-indigo-200 transition-colors text-sm font-medium"
      >
        <LuPlus className="w-4 h-4" />
        Add Line Item
      </button>

      {/* --- Totals --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t">
        <div className="md:col-span-2"></div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Subtotal:</span>
            <span className="font-bold text-gray-900">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <label htmlFor="discount" className="text-gray-600 font-medium">Discount ($):</label>
            <input
              type="number" id="discount" value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              className="w-24 py-1 px-2 text-right border border-gray-300 rounded-lg"
            />
          </div>
           <div className="flex justify-between items-center gap-2">
            <label htmlFor="tax" className="text-gray-600 font-medium">Tax (%):</label>
            <input
              type="number" id="tax" value={tax}
              onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
              className="w-24 py-1 px-2 text-right border border-gray-300 rounded-lg"
            />
          </div>
          <div className="border-t"></div>
          <div className="flex justify-between items-center text-xl">
            <span className="font-bold text-gray-900">Grand Total:</span>
            <span className="font-bold text-indigo-600">${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      {/* --- Submit --- */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <button
          type="button"
          className="px-6 py-3 font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Save as Draft
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 font-semibold text-white 
                     bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          <LuSave className="w-5 h-5" />
          Generate Invoice
        </button>
      </div>
    </form>
  );
};

/**
 * ==========================================
 * Helper: Staff/Doctor Paystub Form
 * ==========================================
 */
const StaffInvoiceForm = ({ type }: { type: 'staff' | 'doctor' }) => {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Staff/Doctor Paystub Data:", { type });
    alert(`${type} paystub created! (Check console)`);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">
        2. Create Paystub for {type === 'doctor' ? 'Doctor' : 'Staff'}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputGroup
          label={type === 'doctor' ? 'Doctor Name' : 'Staff Name'}
          name="staffId" type="select" icon={LuUser}
          value="" onChange={() => {}}
        >
          <option value="">Select a {type}</option>
          {dummyStaff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </InputGroup>
        
        <InputGroup
          label="Paystub Type" name="paystubType" type="select" icon={LuFileText}
          value="Salary" onChange={() => {}}
        >
          <option value="Salary">Monthly Salary</option>
          <option value="Expense">Expense Reimbursement</option>
          <option value="Bonus">Bonus / Incentive</option>
        </InputGroup>
        
        <InputGroup
          label="Pay Period (Start)" name="payPeriodStart" type="date" icon={LuCalendar}
          value="" onChange={() => {}}
        />
        <InputGroup
          label="Pay Period (End)" name="payPeriodEnd" type="date" icon={LuCalendar}
          value="" onChange={() => {}}
        />
      </div>
      
      <div className="flex justify-end gap-4 pt-6 border-t">
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 font-semibold text-white 
                     bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          <LuSave className="w-5 h-5" />
          Generate Paystub
        </button>
      </div>
    </form>
  );
};

/**
 * ==========================================
 * Helper: Form Input Component
 * ==========================================
 */
const InputGroup = ({
  label, name, value, onChange, icon: Icon, type = 'text', required = false, children,
}: {
  label: string; name: string; value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  icon: React.ElementType; type?: string; required?: boolean; children?: React.ReactNode;
}) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative mt-2">
      <span className="absolute left-3 top-3.5 text-gray-400 z-10">
        <Icon className="w-5 h-5" />
      </span>
      {type === 'select' ? (
        <select
          name={name} id={name} value={value} onChange={onChange} required={required}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg appearance-none
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {children}
        </select>
      ) : (
        <input
          type={type} name={name} id={name} value={value} onChange={onChange} required={required}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      )}
    </div>
  </div>
);
