import type { z } from 'zod';
import { AppError } from '../../utils/app-error.js';
import { StaffMemberModel } from '../staff-member/staff-member.model.js';
import { PayrollModel } from './payroll.model.js';
import type { createPayrollSchema, updatePayrollSchema } from './payroll.validation.js';

type CreatePayrollPayload = z.infer<typeof createPayrollSchema>['body'];
type UpdatePayrollPayload = z.infer<typeof updatePayrollSchema>['body'];

export async function createPayroll(payload: CreatePayrollPayload, createdBy: string) {
  const staffMember = payload.staffMemberId ? await StaffMemberModel.findById(payload.staffMemberId) : null;

  if (payload.staffMemberId && !staffMember) {
    throw new AppError('Staff member not found', 404);
  }

  const payroll = await PayrollModel.create({
    payrollNumber: buildPayrollNumber(),
    staffMember: staffMember?._id,
    employeeName: payload.employeeName || staffMember?.name,
    employeeId: payload.employeeId || staffMember?.staffId,
    department: payload.department || staffMember?.department,
    designation: payload.designation || staffMember?.role,
    salary: payload.salary,
    month: payload.month,
    paymentDate: new Date(payload.paymentDate),
    status: payload.status ?? 'pending',
    notes: payload.notes,
    createdBy,
  });

  return getPayrollById(payroll.id);
}

export async function getPayrolls() {
  return PayrollModel.find().populate('staffMember').populate('createdBy', '-password').sort({ paymentDate: -1, createdAt: -1 });
}

export async function updatePayroll(payrollId: string, payload: UpdatePayrollPayload) {
  const staffMember = payload.staffMemberId ? await StaffMemberModel.findById(payload.staffMemberId) : null;

  if (payload.staffMemberId && !staffMember) {
    throw new AppError('Staff member not found', 404);
  }

  const payroll = await PayrollModel.findByIdAndUpdate(
    payrollId,
    {
      ...(payload.staffMemberId !== undefined ? { staffMember: payload.staffMemberId || undefined } : {}),
      ...(payload.employeeName ? { employeeName: payload.employeeName } : {}),
      ...(payload.employeeId ? { employeeId: payload.employeeId } : {}),
      ...(payload.department ? { department: payload.department } : {}),
      ...(payload.designation ? { designation: payload.designation } : {}),
      ...(payload.salary !== undefined ? { salary: payload.salary } : {}),
      ...(payload.month ? { month: payload.month } : {}),
      ...(payload.paymentDate ? { paymentDate: new Date(payload.paymentDate) } : {}),
      ...(payload.status ? { status: payload.status } : {}),
      ...(payload.notes !== undefined ? { notes: payload.notes || undefined } : {}),
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .populate('staffMember')
    .populate('createdBy', '-password');

  if (!payroll) {
    throw new AppError('Payroll record not found', 404);
  }

  return payroll;
}

export async function deletePayroll(payrollId: string) {
  const deletedPayroll = await PayrollModel.findByIdAndDelete(payrollId);

  if (!deletedPayroll) {
    throw new AppError('Payroll record not found', 404);
  }
}

async function getPayrollById(payrollId: string) {
  const payroll = await PayrollModel.findById(payrollId).populate('staffMember').populate('createdBy', '-password');

  if (!payroll) {
    throw new AppError('Payroll record not found', 404);
  }

  return payroll;
}

function buildPayrollNumber() {
  const randomPart = Math.floor(Math.random() * 900 + 100);
  return `SAL-${Date.now().toString().slice(-6)}-${randomPart}`;
}
