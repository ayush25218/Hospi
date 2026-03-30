import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendResponse } from '../../utils/api-response.js';
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

  sendResponse({
    res,
    message: 'Room updated successfully',
    data: room,
  });
});

export const assignRoomHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const room = await assignRoom(req.params.id, req.body);

  sendResponse({
    res,
    message: 'Room assigned successfully',
    data: room,
  });
});

export const updateRoomStatusHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const room = await updateRoomStatus(req.params.id, req.body);

  sendResponse({
    res,
    message: 'Room status updated successfully',
    data: room,
  });
});

export const vacateRoomHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const room = await vacateRoom(req.params.id, req.body);

  sendResponse({
    res,
    message: 'Room vacated successfully',
    data: room,
  });
});

export const deleteRoomHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await deleteRoom(req.params.id);

  sendResponse({
    res,
    message: 'Room deleted successfully',
  });
});
