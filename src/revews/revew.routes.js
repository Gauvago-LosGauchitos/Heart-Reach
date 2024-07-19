import { Router } from "express"
import { validateJwt } from '../middlewares/validate-jwt.js'
import { isAdmin } from '../utils/validator.js'
import { newRevew, getAllReviews, getOrganizationReviews} from './revew.controller.js'

const api = Router();

api.post('/newRevew',[validateJwt], newRevew); 
api.get('/getAllReviews', getAllReviews);
api.post('/getOrganizationReviews',[validateJwt], getOrganizationReviews);

export default api