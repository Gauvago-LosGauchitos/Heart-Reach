import { Router } from "express";
import { UpdateV, addType, deleteV, listarVolunteering, registerV, test, messages, getVolunteeringTypes, updateStatus } from './volunteering.controller.js'
import { validateJwt } from "../middlewares/validate-jwt.js";
import { upload } from '../utils/multerConfig.js';

const api = Router();

api.get('/test', test);
api.post('/registerV',[validateJwt, upload.single('img')], registerV)
api.delete('/deleteV/:id', deleteV)
api.get('/listarVolunteering', listarVolunteering)
api.put('/UpdateV/:id', UpdateV)
api.put('/add/Type', addType)
api.get('/messages/:chatRoom', messages)
api.get('/getTypesOfVolunteering', [validateJwt], getVolunteeringTypes)
api.get('/actualizate/status', updateStatus)

export default api