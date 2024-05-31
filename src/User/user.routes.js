import { Router } from "express"
import multer from 'multer'
import { test, register, login } from './user.controller.js'

const api = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'dataImages/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage});

api.get('/test', test)

api.post('/register',upload.array('images', 10), register)
api.post('/login', login)


export default api