import { Router } from "express";
import { registerV, test } from './volunteering.controller.js'

const api = Router();

api.get('/test', test);
api.post('/registerV',registerV)

export default api