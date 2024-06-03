'use strict'

import { hash, compare } from 'bcrypt';
//encriptar cualquier cosa
export const encrypt = (value) => {
    try {
        return hash(value, 10);
    } catch (err) {
        console.error(err);
        return err;
    }
}

//Validar encriptaciones

export const checkEncrypt = async (value, valueEncrypt) => {
    try {
        return await compare(value, valueEncrypt);
    } catch (err) {
        console.error(err);
        return err;
    }
}

//validar actualizacion
export const checkUpdate = (data, role) => {
    
    if (role == 'ADMIN-PLATFORM') {
        if (
            Object.entries(data).length === 0 ||
            data.password || //si cambia la password devuelve false
            data.password == '' //si envia la password vacia
        ) return false;
        return true;
    } else {
        if (
            Object.entries(data).length === 0 ||
            data.password || //si cambia la password devuelve false
            data.password == '' || //si envia la password vacia
            data.role || //si modifica el rol
            data.role == '' //si deja el rol vacio.
        ) return false;
        return true;
    }

}

export const isAdmin = async (req, res, next) => {
    try {
        let { user } = req;//req que ya tenemos
        if (!user || user.role !== 'ADMIN') return res.status(403).send({ message: `You dont have access. | username: ${user.username}` });
        next();
    } catch (err) {
        console.error(err);
        return res.status(403).send({ message: `Unauthorization role` })
    }
}

export const isAsociation = async (req, res, next) => {
    try {
        let { user } = req;//req que ya tenemos
        if (!user || user.role !== 'ADMIN-ASOCIATION') return res.status(403).send({ message: `You dont have access. | username: ${user.username}` });
        next();
    } catch (err) {
        console.error(err);
        return res.status(403).send({ message: `Unauthorization role` })
    }
}

export const isUser = async (req, res, next) => {
    try {
        let { user } = req;//req que ya tenemos
        if (!user || user.role !== 'USER') return res.status(403).send({ message: `You dont have access. | username: ${user.username}` });
        next();
    } catch (err) {
        console.error(err);
        return res.status(403).send({ message: `Unauthorization role` })
    }
}

  //Update Volunteering
  export const checkUpdateV = (data, volunteeringId) => {
    if (volunteeringId) {
        if (Object.keys(data).length === 0) {
            return false;
        }
        for (const key in data) {
            if (data[key] === '') {
                return false;
            }
        }
        return true;
    } else {
        return false;
    }
}

