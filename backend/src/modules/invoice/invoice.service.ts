import type { z } from 'zod';
import { AppError } from '../../utils/app-error.js';
import { DoctorModel } from '../doctor/doctor.model.js';
import { PatientModel } from '../patient/patient.model.js';
import { InvoiceModel } from './invoice.model.js';
import type { createInvoiceSchema } from './invoice.validation.js';

type CreateInvoicePayload = z.infer<typeof createInvoiceSchema>['body'];

export async function createInvoice(payload: CreateInvoicePayload, createdBy: string) {
  const { subtotal, taxAmount, totalAmount } = calculateInvoiceTotals(payload.lineItems, payload.discount ?? 0, payload.taxRate ?? 0);

  const invoiceData = {
    invoiceNumber: buildInvoiceNumber(payload.recipientType),
    recipientType: payload.recipientType,
    recipientName: payload.recipientName,
    recipientEmail: payload.recipientEmail,
    paystubType: payload.paystubType ?? (payload.recipientType === 'patient' ? 'patient-bill' : 'salary'),
    issueDate: new Date(payload.issueDate),
    periodStart: payload.periodStart ? new Date(payload.periodStart) : undefined,
    periodEnd: payload.periodEnd ? new Date(payload.periodEnd) : undefined,
    lineItems: payload.lineItems,
    taxRate: payload.taxRate ?? 0,
    discount: payload.discount ?? 0,
    subtotal,
    taxAmount,
    totalAmount,
    status: payload.status ?? 'pending',
    notes: payload.notes,
    createdBy,
  } as const;

  if (payload.recipientType === 'patient') {
    if (!payload.patientId) {
      throw new AppError('Patient invoice requires a patient', 400);
    }

    const patient = await PatientModel.findById(payload.patientId).populate('user', '-password');

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    const invoice = await InvoiceModel.create({
      ...invoiceData,
      patient: patient._id,
      recipientName: payload.recipientName || String((patient.user as { name?: string })?.name ?? ''),
      recipientEmail: payload.recipientEmail || String((patient.user as { email?: string })?.email ?? ''),
    });

    return getInvoiceById(invoice.id);
  }

  if (payload.recipientType === 'doctor') {
    if (!payload.doctorId) {
      throw new AppError('Doctor paystub requires a doctor', 400);
    }

    const doctor = await DoctorModel.findById(payload.doctorId).populate('user', '-password');

    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }

    const invoice = await InvoiceModel.create({
      ...invoiceData,
      doctor: doctor._id,
      recipientName: payload.recipientName || String((doctor.user as { name?: string })?.name ?? ''),
      recipientEmail: payload.recipientEmail || String((doctor.user as { email?: string })?.email ?? ''),
    });

    return getInvoiceById(invoice.id);
  }

  const invoice = await InvoiceModel.create(invoiceData);
  return getInvoiceById(invoice.id);
}

export async function getInvoices() {
  return InvoiceModel.find()
    .populate({ path: 'patient', populate: { path: 'user', select: '-password' } })
    .populate({ path: 'doctor', populate: { path: 'user', select: '-password' } })
    .populate('createdBy', '-password')
    .sort({ createdAt: -1 });
}

export async function deleteInvoice(invoiceId: string) {
  const deletedInvoice = await InvoiceModel.findByIdAndDelete(invoiceId);

  if (!deletedInvoice) {
    throw new AppError('Invoice not found', 404);
  }
}

async function getInvoiceById(invoiceId: string) {
  const invoice = await InvoiceModel.findById(invoiceId)
    .populate({ path: 'patient', populate: { path: 'user', select: '-password' } })
    .populate({ path: 'doctor', populate: { path: 'user', select: '-password' } })
    .populate('createdBy', '-password');

  if (!invoice) {
    throw new AppError('Invoice not found', 404);
  }

  return invoice;
}

function calculateInvoiceTotals(
  lineItems: CreateInvoicePayload['lineItems'],
  discount: number,
  taxRate: number,
) {
  const subtotal = lineItems.reduce((accumulator, item) => {
    return accumulator + item.quantity * item.price;
  }, 0);
  const discountedSubtotal = Math.max(subtotal - discount, 0);
  const taxAmount = discountedSubtotal * (taxRate / 100);
  const totalAmount = discountedSubtotal + taxAmount;

  return {
    subtotal,
    taxAmount,
    totalAmount,
  };
}

function buildInvoiceNumber(recipientType: CreateInvoicePayload['recipientType']) {
  const prefix = recipientType === 'patient' ? 'INV' : 'PAY';
  const randomPart = Math.floor(Math.random() * 900 + 100);
  return `${prefix}-${Date.now().toString().slice(-6)}-${randomPart}`;
}
