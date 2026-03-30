import type { z } from 'zod';
import { AppError } from '../../utils/app-error.js';
import { InvoiceModel } from '../invoice/invoice.model.js';
import { PatientModel } from '../patient/patient.model.js';
import { PaymentModel } from './payment.model.js';
import type { createPaymentSchema, updatePaymentSchema } from './payment.validation.js';

type CreatePaymentPayload = z.infer<typeof createPaymentSchema>['body'];
type UpdatePaymentPayload = z.infer<typeof updatePaymentSchema>['body'];

export async function createPayment(payload: CreatePaymentPayload, createdBy: string) {
  const [patient, invoice] = await Promise.all([
    payload.patientId ? PatientModel.findById(payload.patientId).populate('user', '-password') : Promise.resolve(null),
    payload.invoiceId ? InvoiceModel.findById(payload.invoiceId) : Promise.resolve(null),
  ]);

  if (payload.patientId && !patient) {
    throw new AppError('Patient not found', 404);
  }

  if (payload.invoiceId && !invoice) {
    throw new AppError('Invoice not found', 404);
  }

  const payment = await PaymentModel.create({
    paymentNumber: buildPaymentNumber(),
    payerName: payload.payerName || String((patient?.user as { name?: string } | undefined)?.name ?? ''),
    payerEmail: payload.payerEmail || String((patient?.user as { email?: string } | undefined)?.email ?? ''),
    patient: patient?._id,
    invoice: invoice?._id,
    amount: payload.amount,
    paymentDate: new Date(payload.paymentDate),
    method: payload.method,
    status: payload.status ?? 'success',
    notes: payload.notes,
    createdBy,
  });

  return getPaymentById(payment.id);
}

export async function getPayments() {
  return PaymentModel.find()
    .populate({ path: 'patient', populate: { path: 'user', select: '-password' } })
    .populate('invoice')
    .populate('createdBy', '-password')
    .sort({ paymentDate: -1, createdAt: -1 });
}

export async function updatePayment(paymentId: string, payload: UpdatePaymentPayload) {
  const [patient, invoice] = await Promise.all([
    payload.patientId ? PatientModel.findById(payload.patientId).populate('user', '-password') : Promise.resolve(null),
    payload.invoiceId ? InvoiceModel.findById(payload.invoiceId) : Promise.resolve(null),
  ]);

  if (payload.patientId && !patient) {
    throw new AppError('Patient not found', 404);
  }

  if (payload.invoiceId && !invoice) {
    throw new AppError('Invoice not found', 404);
  }

  const payment = await PaymentModel.findByIdAndUpdate(
    paymentId,
    {
      ...(payload.payerName ? { payerName: payload.payerName } : {}),
      ...(payload.payerEmail !== undefined ? { payerEmail: payload.payerEmail || undefined } : {}),
      ...(payload.patientId !== undefined ? { patient: payload.patientId || undefined } : {}),
      ...(payload.invoiceId !== undefined ? { invoice: payload.invoiceId || undefined } : {}),
      ...(payload.amount !== undefined ? { amount: payload.amount } : {}),
      ...(payload.paymentDate ? { paymentDate: new Date(payload.paymentDate) } : {}),
      ...(payload.method ? { method: payload.method } : {}),
      ...(payload.status ? { status: payload.status } : {}),
      ...(payload.notes !== undefined ? { notes: payload.notes || undefined } : {}),
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .populate({ path: 'patient', populate: { path: 'user', select: '-password' } })
    .populate('invoice')
    .populate('createdBy', '-password');

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  return payment;
}

export async function deletePayment(paymentId: string) {
  const deletedPayment = await PaymentModel.findByIdAndDelete(paymentId);

  if (!deletedPayment) {
    throw new AppError('Payment not found', 404);
  }
}

async function getPaymentById(paymentId: string) {
  const payment = await PaymentModel.findById(paymentId)
    .populate({ path: 'patient', populate: { path: 'user', select: '-password' } })
    .populate('invoice')
    .populate('createdBy', '-password');

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  return payment;
}

function buildPaymentNumber() {
  const randomPart = Math.floor(Math.random() * 900 + 100);
  return `PAY-${Date.now().toString().slice(-6)}-${randomPart}`;
}
