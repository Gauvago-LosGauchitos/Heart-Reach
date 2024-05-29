import express from 'express'

import {  deleteU, login, registerU, testU, updateUser } from './user.controller.js';
import {isAdmin ,validateJwt} from '../../middlewares/validate-jwt.js'

const api = express.Router()

api.get('/testU', testU)
api.post('/login', login)
api.post('/registerU',registerU)
api.put('/updateU', [validateJwt], updateUser)
api.delete('/deleteU/:id', [validateJwt],deleteU)

export default api