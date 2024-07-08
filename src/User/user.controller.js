'use strict'
//import jwt from 'jsonwebtoken';
import User from './user.model.js';
import { checkEncrypt, checkUpdate, encrypt } from '../utils/validator.js';
import { generateJwt } from '../utils/jwt.js';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';


export const test = (req, res) => {
    console.log('User test is runing.')
    return res.send({ message: 'User test is running...' })
}

export const register = async (req, res) => {
    try {
        let data = req.body;
       
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

export const registerForAdmin = async (req, res) => {
    try {
        let data = req.body;
       
        //encriptar la contrasenia y el telefono
        data.password = await encrypt(data.password);

        //ingresamos el rol cliente por defecto
        data.role = 'ADMIN';
        let user = new User(data)
        await user.save()
        return res.send({ message: `Admin register successfull!`, user });
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: `Error registering Admin`, err })
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

export const updateProfile = async (req, res) => {
    try {
        let { userId } = req.params;
        let data = req.body;

        // Verificar si se ha enviado una nueva imagen
        if (req.files && req.files.length > 0) {
            const newImage = req.files[0].path;

            // Buscar el usuario actual para obtener la ruta de la imagen anterior
            let currentUser = await User.findById(userId);

            // Si el usuario tiene una imagen anterior, borrarla
            if (currentUser.imageProfile && currentUser.imageProfile.length > 0) {
                const oldImagePath = path.resolve(currentUser.imageProfile[0]); // Acceder al primer elemento del array
                fs.unlink(oldImagePath, (err) => {
                    if (err) console.error(`No se pudo eliminar la imagen anterior: ${err}`);
                });
            }

            // Asignar la nueva ruta de la imagen al campo imageProfile
            data.imageProfile = [newImage]; // Almacenar la nueva imagen en un array
        }

        // Actualizar el perfil del usuario
        let user = await User.findOneAndUpdate(
            { _id: userId },
            data,
            { new: true }
        );

        return res.send({ message: 'Perfil modificado exitosamente', user });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error al modificar el perfil de otro usuario' });
    }
};

export const getUser = async (req, res) => {
    try {
        // Obtener la clave secreta para el token
        const secretKey = process.env.SECRET_KEY;
        
        // Obtener el token de los encabezados
        const { authorization } = req.headers;
        // Verificar el token
        const { uid } = jwt.verify(authorization, secretKey);
        
        // Buscar el usuario por ID
        const user = await User.findById( uid);

        // Comprobar si el usuario existe
        if (!user) {
            return res.status(404).send({ message: 'Usuario no encontrado.' });
        }

        // Construir la URL de la imagen de perfil del usuario (si la hay)
        const profileImageUrl = user.imageProfile && user.imageProfile.length > 0 ? `${req.protocol}://${req.get('host')}/${user.imageProfile[0]}` : null;

        // Enviar la respuesta con el usuario y la URL de su imagen de perfil
        res.status(200).json({
            _id: user._id,
            name: user.name,
            surname: user.surname,
            username: user.username,
            email: user.email,
            phone: user.phone,
            imageProfile: profileImageUrl,
            role: user.role,
            dpi: user.dpi,
            habilities: user.habilities
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error al obtener el usuario', err });
    }
};

export const get = async (req, res) => {
    try {
        let users = await User.find({ role: 'USER' });
        return res.send({ users })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: `Error to get user`, err })
    }
}