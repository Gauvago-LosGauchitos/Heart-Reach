'use strict'
import User from './user.model.js';
import { checkEncrypt, checkUpdate, encrypt } from '../utils/validator.js';
import { generateJwt } from '../utils/jwt.js';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { PrivateMessage } from '../chat/privateMessage.model.js';
import { UserMessage } from '../chat/userMessage.model.js'


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
        let data = req.body;

        // Obtener userId del token de autorización
        let { authorization } = req.headers;
        let secretKey = process.env.SECRET_KEY;
        let { uid } = jwt.verify(authorization, secretKey); // Extraer el userId del token

        // Verificar si se ha enviado una nueva imagen
        if (req.files && req.files.length > 0) {
            const newImage = req.files[0].path;

            // Buscar el usuario actual para obtener la ruta de la imagen anterior
            let currentUser = await User.findById(uid);

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
            { _id: uid },
            data,
            { new: true }
        );

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        return res.send({ message: 'Perfil modificado exitosamente', user });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error al modificar el perfil del usuario' });
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
        const user = await User.findById(uid);

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

// Obtener mensajes privados antiguos entre usuario y organización
export const getPrivateMessages = async (req, res) => {
    try {
        const { user, organization } = req.body;
        const data = req.body;
        let messages = await PrivateMessage.find({
            user,
            organization
        }).sort({ timestamp: 1 }).populate({
            path: 'user organization',
            select: 'username name imageProfile'
        });

        // Si no hay mensajes encontrados, crear uno nuevo
        if (!messages.length) {
            const newMessage = new PrivateMessage({
                messages: [data.message],
                user: data.user, // ID del usuario
                organization: data.organization // ID de la organización
            });
            await newMessage.save();
            return res.send({ message: 'guardado', newMessage });
        }

        // Formatear los mensajes encontrados
        const formattedMessages = messages.map(message => message.messages).flat();
        res.send(formattedMessages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al obtener los mensajes privados' });
    }
};


export const getUserMessages = async (req, res) => {
    try {
        const { sender, receiver } = req.body;

        // Verifica si sender y receiver están presentes y son strings
        const senderId = new mongoose.Types.ObjectId(sender.sender || sender);
        const receiverId = new mongoose.Types.ObjectId(receiver || sender.receiver);

        // Encuentra los mensajes entre el remitente y el receptor
        const messages = await UserMessage.find({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ]
        }).sort({ timestamp: 1 }).populate({
            path: 'sender receiver',
            select: 'username imageProfile dpi habilities'
        });

        // Mapea los mensajes si existen
        let messags = messages ? messages.map(message => message.message) : [];
        console.log(messags);

        // Devuelve los mensajes encontrados
        res.send(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al obtener los mensajes privados entre usuarios' });
    }
};




// Enviar mensaje privado entre usuario y organización
export const sendPrivateMessage = async (req, res) => {
    try {
        const { user, organization, username, message } = req.body;
        let privateMessage = await PrivateMessage.findOne({ user, organization });

        if (!privateMessage) {
            privateMessage = new PrivateMessage({ user, organization, messages: [] });
        }

        privateMessage.messages.push({ username, message });
        await privateMessage.save();

        res.status(200).json(privateMessage);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al enviar el mensaje privado' });
    }
};

// Enviar mensaje privado entre dos usuarios
export const sendUserMessage = async (req, res) => {
    try {
        const { sender, receiver, message } = req.body;
        let userMessage = await UserMessage.findOne({ sender, receiver });

        if (!userMessage) {
            userMessage = new UserMessage({ sender, receiver, messages: [] });
        }

        userMessage.messages.push({ message });
        await userMessage.save();

        res.status(200).json(userMessage);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al enviar el mensaje entre usuarios' });
    }
};


//Guardar mensajes

export const searchUsers = async (req, res) => {
    const { query } = req.query;
    try {
        const users = await User.find({ name: { $regex: query, $options: 'i' } });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error buscando usuarios' });
    }
};

// Función para obtener contactos de un usuario
export const getUserContacts = async (req, res) => {
    try {
        // Obtener el ID de usuario del token decodificado
        const userId = req.user._id;

        // Obtener contactos de mensajes entre usuarios
        const userContacts = await UserMessage.aggregate([
            { 
                $match: { $or: [{ sender: userId }, { receiver: userId }] } 
            },
            {
                $group: {
                    _id: null,
                    contacts: { 
                        $addToSet: { 
                            $cond: [
                                { $ne: ["$sender", userId] }, 
                                "$sender", 
                                "$receiver"
                            ] 
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "users", // Nombre de la colección de usuarios
                    localField: "contacts",
                    foreignField: "_id",
                    as: "userContacts"
                }
            },
            {
                $addFields: {
                    users: "$userContacts"
                }
            },
            {
                $project: {
                    userContacts: 0 // Opcional: para excluir el campo userContacts si no se necesita
                }
            }
        ]);

        // Obtener nombres de organizaciones
        const orgContacts = await PrivateMessage.aggregate([
            { 
                $match: { user: userId } 
            },
            {
                $group: {
                    _id: "$organization",
                }
            },
            {
                $lookup: {
                    from: "organizations", // Nombre de la colección de organizaciones
                    localField: "_id",
                    foreignField: "_id",
                    as: "orgContacts"
                }
            },
            {
                $addFields: {
                    organizations: "$orgContacts"
                }
            },
            {
                $project: {
                    orgContacts: 0 // Opcional: para excluir el campo orgContacts si no se necesita
                }
            }
        ]);

        const contacts = {
            users: userContacts.length > 0 ? userContacts[0].users : [],
            organizations: orgContacts.map(contact => contact.organizations[0].name)
        };

        res.status(200).json(contacts);
    } catch (error) {
        console.error('Error al obtener contactos:', error);
        res.status(500).json({ message: 'Error al obtener contactos', error });
    }
};

