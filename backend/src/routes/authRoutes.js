import express from 'express';
import * as authController from '../controllers/authController.js'

const router = express.Router();
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser)
router.post('/logout', authController.logoutUser)
router.post('/refresh', authController.refreshAccessToken);

export default router;