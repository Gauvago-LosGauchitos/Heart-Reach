'use strict'

//import jwt from 'jsonwebtoken';
import User from './user.model.js';
import { checkEncrypt,/*, checkUpdate,*/encrypt } from '../utils/validator.js';
import { generateJwt } from '../utils/jwt.js';


export const test = (req, res) => {
    console.log('User test is runing.')
    return res.send({ message: 'User test is running...' })
}

export const register = async (req, res) => {
    try {
        let data = req.body;
        //capturar las imagenes
        const images = req.files.map(file => file.path);
        console.log(images)

        //guardamos la ruta y el nombre de la imagen
        data.imageProfile = images;
        //encriptar la contrasenia y el telefono
        data.password = await encrypt(data.password);

        //ingresamos el rol cliente por defecto
        data.role = 'USER';
        let user = new User(data)
        await user.save()
        return res.send({ message: `User register successfull!`, user });
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: `Error registering user`, err })
    }
}


export const login = async (req, res) => {
    try {
        let { username, password } = req.body;
        let user = await User.findOne({ $or: [{ username }, { email: username }] });
        if (!user) return res.status(404).send({ message: `Invalid credentials.` })

        //validamos que el usuario este activo
        if (user.status == false) return res.status(403).send({ message: `You don't have access | Please contact technical support.` });

        if (await checkEncrypt(password, user.password)) {
            let loggedUser = {
                uid: user._id,
                username: user.username,
                name: user.name,
                role: user.role
            }

            //generar el token y enviarlo como respuesta.
            let token = await generateJwt(loggedUser);
            return res.send({
                message: `WELCOME ${user.username}`,
                loggedUser,
                token
            })
        }
        //si no coincide la contrasenia
        return res.status(400).send({ message: `Invalid credentials` });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error to login`, err });
    }
}