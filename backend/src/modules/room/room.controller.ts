import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendResponse } from '../../utils/api-response.js';
import { recordAuditEvent } from '../audit-log/audit-log.service.js';
import {
  assignRoom,
  createRoom,
  deleteRoom,
  getRooms,
  updateRoom,
  updateRoomStatus,
  vacateRoom,
} from './room.service.js';

export const createRoomHandler = asyncHandler(async (req: Request, res: Response) => {
  const room = await createRoom(req.body, req.user!.id);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'room.created',
    entityType: 'room',
    entityId: room._id?.toString(),
    summary: `Created room ${room.roomNumber}`,
  });

  sendResponse({
    res,
    statusCode: 201,
    message: 'Room created successfully',
    data: room,
  });
});

export const getRoomsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const rooms = await getRooms();

  sendResponse({
    res,
    message: 'Rooms fetched successfully',
    data: rooms,
  });
});

export const updateRoomHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const room = await updateRoom(req.params.id, req.body);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'room.updated',
    entityType: 'room',
    entityId: room._id?.toString(),
    summary: `Updated room ${room.roomNumber}`,
  });

  sendResponse({
    res,
    message: 'Room updated successfully',
    data: room,
  });
});

export const assignRoomHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const room = await assignRoom(req.params.id, req.body);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'room.assigned',
    entityType: 'room',
    entityId: room._id?.toString(),
    summary: `Assigned room ${room.roomNumber}`,
  });

  sendResponse({
    res,
    message: 'Room assigned successfully',
    data: room,
  });
});

export const updateRoomStatusHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const room = await updateRoomStatus(req.params.id, req.body);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'room.status-updated',
    entityType: 'room',
    entityId: room._id?.toString(),
    summary: `Updated room ${room.roomNumber} status to ${room.status}`,
  });

  sendResponse({
    res,
    message: 'Room status updated successfully',
    data: room,
  });
});

export const vacateRoomHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const room = await vacateRoom(req.params.id, req.body);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'room.vacated',
    entityType: 'room',
    entityId: room._id?.toString(),
    summary: `Vacated room ${room.roomNumber}`,
  });

  sendResponse({
    res,
    message: 'Room vacated successfully',
    data: room,
  });
});

export const deleteRoomHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await deleteRoom(req.params.id);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'room.deleted',
    entityType: 'room',
    entityId: req.params.id,
    summary: 'Deleted room entry',
  });

  sendResponse({
    res,
    message: 'Room deleted successfully',
  });
});
