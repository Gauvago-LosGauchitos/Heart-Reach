'use strict'

import jwt from 'jsonwebtoken';
import User from '../User/user.model';

export const validateJwt = async (req, res, next) => {
    try {
        let secretKey = process.env.SECRET_KEY;
        let { authorization } = req.headers;
        console.log(authorization);
        if (!authorization) return res.status(401).send({ message: `Unauthorization` });
        let { uid } = jwt.verify(authorization, secretKey);
        //buscar el usuario por id
        let user = await User.findOne({ _id: uid });
        if (!user) return res.status(404).send({ message: `User not found - Unauthorization.` });
        //validar si esta activo para dar acceso
        if(user.status == false) return res.status(403).send({message:`Unauthorized.`})
        req.user = user;
        next();
    } catch (err) {
        console.error(err);
        return res.status(401).send({ message: `Invalid token` })
    }
}