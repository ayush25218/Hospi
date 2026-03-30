import type { z } from 'zod';
import type { AuthenticatedUser } from '../../types/authenticated-user.js';
import { AppError } from '../../utils/app-error.js';
import { getOrganizationUserIds } from '../../utils/organization-scope.js';
import { DoctorModel } from '../doctor/doctor.model.js';
import { DepartmentModel } from './department.model.js';
import type { createDepartmentSchema, updateDepartmentSchema } from './department.validation.js';

type CreateDepartmentPayload = z.infer<typeof createDepartmentSchema>['body'];
type UpdateDepartmentPayload = z.infer<typeof updateDepartmentSchema>['body'];

export async function createDepartment(payload: CreateDepartmentPayload, actor: AuthenticatedUser) {
  const organizationUserIds = await getOrganizationUserIds(actor.organizationId);

  if (payload.headDoctorId) {
    const doctor = await DoctorModel.findOne({ _id: payload.headDoctorId, user: { $in: organizationUserIds } });

    if (!doctor) {
      throw new AppError('Head doctor not found', 404);
    }
  }

  const department = await DepartmentModel.create({
    name: payload.name,
    description: payload.description,
    headDoctor: payload.headDoctorId,
    staffCount: payload.staffCount ?? 0,
    createdBy: actor.id,
  });

  return getDepartmentById(department.id, actor);
}

export async function getDepartments(actor: AuthenticatedUser) {
  const organizationUserIds = await getOrganizationUserIds(actor.organizationId);
  const departments = await DepartmentModel.find({ createdBy: { $in: organizationUserIds } })
    .populate({ path: 'headDoctor', populate: { path: 'user', select: '-password' } })
    .populate('createdBy', '-password')
    .sort({ name: 1 });

  return Promise.all(
    departments.map(async (department) => {
      const doctorCount = await DoctorModel.countDocuments({
        department: department.name,
        user: { $in: organizationUserIds },
      });

      return {
        ...department.toObject(),
        doctorCount,
      };
    }),
  );
}

export async function updateDepartment(departmentId: string, payload: UpdateDepartmentPayload, actor: AuthenticatedUser) {
  const organizationUserIds = await getOrganizationUserIds(actor.organizationId);

  if (payload.headDoctorId) {
    const doctor = await DoctorModel.findOne({ _id: payload.headDoctorId, user: { $in: organizationUserIds } });

    if (!doctor) {
      throw new AppError('Head doctor not found', 404);
    }
  }

  const department = await DepartmentModel.findOneAndUpdate(
    { _id: departmentId, createdBy: { $in: organizationUserIds } },
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

  return getDepartmentById(department.id, actor);
}

export async function deleteDepartment(departmentId: string, actor: AuthenticatedUser) {
  const organizationUserIds = await getOrganizationUserIds(actor.organizationId);
  const deletedDepartment = await DepartmentModel.findOneAndDelete({
    _id: departmentId,
    createdBy: { $in: organizationUserIds },
  });

  if (!deletedDepartment) {
    throw new AppError('Department not found', 404);
  }
}

async function getDepartmentById(departmentId: string, actor: AuthenticatedUser) {
  const organizationUserIds = await getOrganizationUserIds(actor.organizationId);
  const department = await DepartmentModel.findOne({
    _id: departmentId,
    createdBy: { $in: organizationUserIds },
  })
    .populate({ path: 'headDoctor', populate: { path: 'user', select: '-password' } })
    .populate('createdBy', '-password');

  if (!department) {
    throw new AppError('Department not found', 404);
  }

  const doctorCount = await DoctorModel.countDocuments({
    department: department.name,
    user: { $in: organizationUserIds },
  });

  return {
    ...department.toObject(),
    doctorCount,
  };
}
