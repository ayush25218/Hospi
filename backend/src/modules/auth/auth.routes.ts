import { Router } from 'express';
import { auth } from '../../middlewares/auth.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { forgotPassword, login, me, register, resetPassword } from './auth.controller.js';
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from './auth.validation.js';

const router = Router();

router.post('/register', auth('admin'), validateRequest(registerSchema), register);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), resetPassword);
router.post('/login', validateRequest(loginSchema), login);
router.get('/me', auth(), me);

export const authRoutes = router;
