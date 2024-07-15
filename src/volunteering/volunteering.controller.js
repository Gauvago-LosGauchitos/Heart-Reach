import Volunteering from "./volunteering.model.js"
import { checkUpdateV } from "../utils/validator.js"
import mongoose from 'mongoose';
import TypeOfVolunteering from './typeOfVolunteering.model.js';
import { Message } from "../chat/message.model.js";
import fs from 'fs';

//testeo
export const test = (req, res) => {
    console.log('test is running')
    return res.send({ message: 'Test is running' })
}

//Register
export const registerV = async (req, res) => {
    try {
        let data = req.body;
        console.log(data)

        // Buscar el tipo de voluntariado
        let typeOfVolunteering = await TypeOfVolunteering.findOne({ name: data.typeOfVolunteering.toUpperCase() });
        
        // Si no existe, crear uno nuevo
        if (!typeOfVolunteering) {
            typeOfVolunteering = new TypeOfVolunteering({ name: data.typeOfVolunteering.toUpperCase() });
            await typeOfVolunteering.save();
        }

        const existingVolunteering = await Volunteering.findOne({ title: data.title });
        if (existingVolunteering) return res.status(400).send({ message: 'El voluntariado ya existe' });

        if(req.file){
            const imageData = fs.readFileSync(req.file.path);
            const base64Image = Buffer.from(imageData).toString('base64')
            const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`
            data.imageVol = imageUrl

            fs.unlinkSybc(req.file.path)
        }

        const allvolunters = await Volunteering.find({ organization: data.organization });
        const date = new Date(data.date);
        const ahora = new Date(Date.now());
        ahora.setDate(ahora.getDate() + 7);
        const volLength = parseInt(allvolunters.length);

        if (volLength > 2) return res.status(400).send({ message: 'Esta organización ya tiene 3 voluntariados' });
        if (date <= ahora) return res.status(400).send({ message: 'La fecha es muy próxima o ya ha pasado' });

        // Asignar el tipo de voluntariado encontrado o creado
        data.typeOfVolunteering = typeOfVolunteering._id;

        let volunteering = new Volunteering(data);
        await volunteering.save();
        return res.send({ message: '¡El voluntariado se ha registrado con éxito!' });
    } catch (err) {
        return res.status(500).send({ message: 'Error al registrar el voluntariado', err });
    }
}

//Crear tipos de voluntariados por defecto
export const createDefaultTypes = async () => {
    const defaultTypes = [
        'EDUCACIÓN',
        'SALUD',
        'MEDIO AMBIENTE',
        'DEPORTES',
        'CULTURA',
        'ASISTENCIA SOCIAL'
    ];

    for (const typeName of defaultTypes) {
        const existingType = await TypeOfVolunteering.findOne({ name: typeName });
        if (!existingType) {
            const newType = new TypeOfVolunteering({ name: typeName });
            await newType.save();
        }
    }
}

//Obtener tipos de voluntariados
export const getVolunteeringTypes = async (req, res) => {
    try {
        const types = await TypeOfVolunteering.find();
        res.json(types);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching volunteering types', error });
    }
};

export const addType = async (req, res) => {
    try {
        let { added } = req.body;

        if (!added) {
            return res.status(400).json({ message: 'A parameter is required' });
        }

        const volunteeringSchema = Volunteering.schema;

        if (!volunteeringSchema.path('TypeOfVolunteering').enumValues.includes(added.toUpperCase())) {
            volunteeringSchema.path('TypeOfVolunteering').enumValues.push(added.toUpperCase());

            // Necesitamos recompilar el modelo para que el cambio surta efecto
            mongoose.models = {};
            mongoose.model('volunteering', volunteeringSchema);

            // Ahora puedes usar el modelo actualizado
            res.status(200).json({ message: `Tipo de voluntariado ${added} agregado al enum` });
        } else {
            res.status(400).json({ message: 'El tipo de voluntariado ya existe en el enum' });
        }

    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error updating the Volunteering', err: err })
    }
}

//Eliminar
export const deleteV = async (req, res) => {
    try {
        let { id } = req.params;
        if (!id) {
            return res.status(400).send({ message: 'ID is required' });
        }
        let deletedVolunteering = await Volunteering.findOneAndDelete({ _id: id });
        if (!deletedVolunteering) return res.status(404).send({ message: 'Volunteering no encontrada y no eliminada' });
        return res.send({ message: `Volunteering con nombre  ${deletedVolunteering.title} eliminado exitosamente` });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error al eliminar a Volunteering' });
    }
}

//Listar
export const listarVolunteering = async (req, res) => {
    try {
        let data = await Volunteering.find().select('-__v').select('-_id');
        return res.send({ data });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'The information cannot be obtained.' });
    }
}

//Update

export const UpdateV = async (req, res) => {
    try {
        let { id } = req.params
        let data = req.body
        let update = checkUpdateV(data, id)
        if (!update) return res.status.send({ message: `Volunteering actualizado exitososamente` })
        let updateVolunteering = await Volunteering.findOneAndUpdate(
            { _id: id },
            data,
            { new: true }
        )
        if (!updateVolunteering) return res.status(404).send({ message: `Volunteering c no encontrado` })
        return res.send({ message: `Volunteering actualizado exitoso` })
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error al actualizar Volunteering', error: error.message })
    }
}

//Obtener mensajes antiguos
export const messages = async (req, res) => {
    try {
        const { chatRoom } = req.params
        const messages = await Message.find({ chatRoom }).sort({ timestamp: 1 })
        return res.send(messages)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error al obtener los mensajes' })
    }
}

