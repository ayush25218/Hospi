import { Router } from 'express';
import { auth } from '../../middlewares/auth.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { login, me, register } from './auth.controller.js';
import { loginSchema, registerSchema } from './auth.validation.js';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.get('/me', auth(), me);

export const authRoutes = router;
