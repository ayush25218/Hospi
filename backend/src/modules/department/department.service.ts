import type { z } from 'zod';
import { AppError } from '../../utils/app-error.js';
import { DoctorModel } from '../doctor/doctor.model.js';
import { DepartmentModel } from './department.model.js';
import type { createDepartmentSchema, updateDepartmentSchema } from './department.validation.js';

type CreateDepartmentPayload = z.infer<typeof createDepartmentSchema>['body'];
type UpdateDepartmentPayload = z.infer<typeof updateDepartmentSchema>['body'];

export async function createDepartment(payload: CreateDepartmentPayload, createdBy: string) {
  if (payload.headDoctorId) {
    const doctor = await DoctorModel.findById(payload.headDoctorId);

    if (!doctor) {
      throw new AppError('Head doctor not found', 404);
    }
  }

  const department = await DepartmentModel.create({
    name: payload.name,
    description: payload.description,
    headDoctor: payload.headDoctorId,
    staffCount: payload.staffCount ?? 0,
    createdBy,
  });

  return getDepartmentById(department.id);
}

export async function getDepartments() {
  const departments = await DepartmentModel.find()
    .populate({ path: 'headDoctor', populate: { path: 'user', select: '-password' } })
    .populate('createdBy', '-password')
    .sort({ name: 1 });

  return Promise.all(
    departments.map(async (department) => {
      const doctorCount = await DoctorModel.countDocuments({ department: department.name });
      return {
        ...department.toObject(),
        doctorCount,
      };
    }),
  );
}

export async function updateDepartment(departmentId: string, payload: UpdateDepartmentPayload) {
  if (payload.headDoctorId) {
    const doctor = await DoctorModel.findById(payload.headDoctorId);

    if (!doctor) {
      throw new AppError('Head doctor not found', 404);
    }
  }

  const department = await DepartmentModel.findByIdAndUpdate(
    departmentId,
    {
      ...(payload.name ? { name: payload.name } : {}),
      ...(payload.description !== undefined ? { description: payload.description } : {}),
      ...(payload.headDoctorId !== undefined ? { headDoctor: payload.headDoctorId || undefined } : {}),
      ...(payload.staffCount !== undefined ? { staffCount: payload.staffCount } : {}),
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!department) {
    throw new AppError('Department not found', 404);
  }

  return getDepartmentById(department.id);
}

export async function deleteDepartment(departmentId: string) {
  const deletedDepartment = await DepartmentModel.findByIdAndDelete(departmentId);

  if (!deletedDepartment) {
    throw new AppError('Department not found', 404);
  }
}

async function getDepartmentById(departmentId: string) {
  const department = await DepartmentModel.findById(departmentId)
    .populate({ path: 'headDoctor', populate: { path: 'user', select: '-password' } })
    .populate('createdBy', '-password');

  if (!department) {
    throw new AppError('Department not found', 404);
  }

  const doctorCount = await DoctorModel.countDocuments({ department: department.name });
  return {
    ...department.toObject(),
    doctorCount,
  };
}
