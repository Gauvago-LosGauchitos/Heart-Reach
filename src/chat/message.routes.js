import { Router } from "express";
import {validateJwt} from "../middlewares/validate-jwt.js"
import { getMessages, addMessage } from "./messageController.js";

const api = Router();
api.post("/addmsg", addMessage);
api.post("/getmsg", getMessages);

export default api