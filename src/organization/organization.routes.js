import { Router } from "express";
import { test, orgRequest } from './organization.controller.js'
import {validateJwt} from "../middlewares/validate-jwt.js"

const api = Router();

api.get('/test', test);
api.post('/request' ,[validateJwt], orgRequest);

export default api