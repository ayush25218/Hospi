import { Router } from 'express';
import { auth } from '../../middlewares/auth.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import {
  assignRoomHandler,
  createRoomHandler,
  deleteRoomHandler,
  getRoomsHandler,
  updateRoomHandler,
  updateRoomStatusHandler,
  vacateRoomHandler,
} from './room.controller.js';
import {
  assignRoomSchema,
  createRoomSchema,
  updateRoomSchema,
  updateRoomStatusSchema,
  vacateRoomSchema,
} from './room.validation.js';

const router = Router();

router.get('/', auth('admin'), getRoomsHandler);
router.post('/', auth('admin'), validateRequest(createRoomSchema), createRoomHandler);
router.patch('/:id', auth('admin'), validateRequest(updateRoomSchema), updateRoomHandler);
router.patch('/:id/assign', auth('admin'), validateRequest(assignRoomSchema), assignRoomHandler);
router.patch('/:id/status', auth('admin'), validateRequest(updateRoomStatusSchema), updateRoomStatusHandler);
router.patch('/:id/vacate', auth('admin'), validateRequest(vacateRoomSchema), vacateRoomHandler);
router.delete('/:id', auth('admin'), deleteRoomHandler);

export const roomRoutes = router;
