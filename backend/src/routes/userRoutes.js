import express from 'express';
import * as userController from '../controllers/userController.js'

const router = express.Router();
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserbyId);
router.post('/', userController.registerUser)

export default = router;