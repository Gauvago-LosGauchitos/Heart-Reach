import express from 'express'


import {  test } from './motion.controller.js';

const api = express.Router();

api.get('/test', test)


export default api