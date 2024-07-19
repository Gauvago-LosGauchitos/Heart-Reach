import { Router } from "express";
import { UpdateV, addType, deleteV, listarVolunteering, registerV, test, messages, getVolunteeringTypes, updateStatus, assignVolunteering, findVolunteer, listarVolunteeringDisponiblesEnCurso } from './volunteering.controller.js'
import { validateJwt } from "../middlewares/validate-jwt.js";
import { upload } from '../utils/multerConfig.js';

const api = Router();

api.get('/test', test);
api.post('/registerV',[validateJwt, upload.single('img')], registerV)
api.delete('/deleteV/:id', deleteV)
api.get('/listarVolunteering', [validateJwt], listarVolunteering)
api.put('/UpdateV/:id', UpdateV)
api.put('/add/Type', addType)
api.get('/messages/:chatRoom', messages)
api.get('/getTypesOfVolunteering', [validateJwt], getVolunteeringTypes)
api.get('/actualizate/status', updateStatus)
api.put('/assignVolunteering', [validateJwt], assignVolunteering)
<<<<<<< HEAD
api.get('/listarVolunteeringDisponiblesEnCurso', listarVolunteeringDisponiblesEnCurso)

=======
api.get('/volunteering/disponible', listarVolunteeringDisponiblesEnCurso)
api.get('/getVolunteering/:id', findVolunteer)
>>>>>>> 65545cca40255b3e1f0bf4f1da43603f40766b22
export default api