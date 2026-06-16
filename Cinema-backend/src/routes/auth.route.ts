import { Router } from 'express';
import {
  registerController,
  loginController,
  verifyOtpController,
  forgotPasswordController,
  resetPasswordController,
} from '../controllers/auth.controller';

const router = Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.post('/verify-otp', verifyOtpController);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);

export default router;
