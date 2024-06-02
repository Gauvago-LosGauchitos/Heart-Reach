import { Router } from "express";
import { test, orgRequest, orgConfirm, orgRemove, orgReject } from './organization.controller.js'
import {validateJwt} from "../middlewares/validate-jwt.js"

const api = Router();

api.get('/test', test);
api.post('/request' ,[validateJwt], orgRequest);
api.put('/confirm', orgConfirm)
api.put('/deny', orgReject)
api.put('/remove', orgRemove)


export default api