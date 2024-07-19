import { Router } from "express"
import multer from 'multer'
import { isAdmin } from '../utils/validator.js'
import { validateJwt } from '../middlewares/validate-jwt.js'
import { test, register, registerForAdmin, login, updateProfile, getUser, get, getPrivateMessages, getUserMessages, searchUsers, sendPrivateMessage, sendUserMessage, getUserContacts, getParticipatingVolunteers  } from './user.controller.js'

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

api.get('/test', test); // Ruta de prueba
api.post('/register', upload.array('images', 10), register); // Ruta de registro con subida de imágenes
api.post('/registerForAdmin',[validateJwt,isAdmin], upload.array('images', 10), registerForAdmin);
api.post('/login', login); // Ruta de inicio de sesión
api.put('/updateProfile', upload.array('images', 1),[validateJwt], updateProfile); // Ruta para actualizar perfil con subida de imagen
api.get('/getUser', [validateJwt], getUser);
api.get('/get', [validateJwt, isAdmin], get);
api.post('/privateMessages', getPrivateMessages)  
api.post('/userMessages', getUserMessages) 
api.post('/privateMessages/send', sendPrivateMessage);
api.post('/userMessages/send', sendUserMessage);
api.post('/contacts', [validateJwt], getUserContacts);
api.get('/search/users', searchUsers);

api.get('/get/volunterings/participating', [validateJwt], getParticipatingVolunteers)

export default api