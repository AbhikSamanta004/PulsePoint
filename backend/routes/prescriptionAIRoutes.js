import express from 'express';
import { explainPrescription } from '../controllers/prescriptionAIController.js';
import upload from '../middlewares/upload.js';
import authUser from '../middlewares/authUser.js';

const prescriptionAIRouter = express.Router();

prescriptionAIRouter.post('/prescription-explain', authUser, upload.single('image'), explainPrescription);

export default prescriptionAIRouter;
