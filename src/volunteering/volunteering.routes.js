import { Router } from "express";
import { UpdateV, addType, deleteV, listarVolunteering, registerV, test, messages } from './volunteering.controller.js'

const api = Router();

api.get('/test', test);
api.post('/registerV',registerV)
api.delete('/deleteV/:id', deleteV)
api.get('/listarVolunteering', listarVolunteering)
api.put('/UpdateV/:id', UpdateV)
api.put('/add/Type', addType)
api.get('/messages/:chatRoom', messages)

export default api