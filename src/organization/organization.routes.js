import { Router } from "express";
import { test } from './organization.controller.js'

const api = Router();

api.get('/test', test);

export default api