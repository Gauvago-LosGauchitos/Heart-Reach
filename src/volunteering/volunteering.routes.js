import { Router } from "express";
import { test } from './volunteering.controller.js'

const api = Router();

api.get('/test', test);

export default api