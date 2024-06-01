import { Router } from "express";
import { test, orgRequest, orgConfirm } from './organization.controller.js'
import {validateJwt} from "../middlewares/validate-jwt.js"

const api = Router();

api.get('/test', test);
api.post('/request' ,[validateJwt], orgRequest);
api.post('/confirm', orgConfirm)

export default api