import Volunteering from "./volunteering.model.js"
import { checkUpdateV } from "../utils/validator.js"
import User from "../User/user.model.js";
import mongoose from 'mongoose';
import TypeOfVolunteering from './typeOfVolunteering.model.js';
import { Message } from "../chat/message.model.js";
import fs from 'fs';
import moment from 'moment-timezone';

//testeo
export const test = (req, res) => {
    console.log('test is running')
    return res.send({ message: 'Test is running' })
}

// Register
export const registerV = async (req, res) => {
    try {
        const data = req.body;
        console.log('Data received:', data.location);

        if (data.error) {
            return res.status(400).send({ message: data.error });
        }

        // Buscar el tipo de voluntariado
        let typeOfVolunteering = await TypeOfVolunteering.findOne({ name: data.typeOfVolunteering });
        console.log('TypeOfVolunteering found:', typeOfVolunteering);

        // Si no existe, crear uno nuevo
        if (!typeOfVolunteering) {
            typeOfVolunteering = new TypeOfVolunteering({ name: data.typeOfVolunteering });
            await typeOfVolunteering.save();
            console.log('TypeOfVolunteering created:', typeOfVolunteering);
        }

        const existingVolunteering = await Volunteering.findOne({ title: data.title });
        if (existingVolunteering) {
            console.log('Volunteering already exists:', existingVolunteering);
            return res.status(400).send({ message: 'El voluntariado ya existe' });
        }

        if (req.file) {
            const imageData = fs.readFileSync(req.file.path);
            const base64Image = Buffer.from(imageData).toString('base64');
            const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;
            data.imageVol = imageUrl;

            fs.unlinkSync(req.file.path);
            console.log('Image processed and deleted from temp storage');
        }

        const allvolunters = await Volunteering.find({ organization: data.organization });
        if (!allvolunters) {
            console.log('No organization found for:', data.organization);
            return res.status(400).send({ message: 'No se ha encontrado ninguna organización' });
        }

        const date = new Date(data.date);
        const ahora = new Date(moment().tz('America/Guatemala').format('MM-DD-YYYY'))
        /* ahora.setDate(ahora.getDate() + 7);*/
        const volLength = allvolunters.length;

        if (volLength > 2) {
            console.log('Organization has more than 3 volunteerings:', volLength);
            return res.status(400).send({ message: 'Esta organización ya tiene 3 voluntariados' });
        }
        if (date <= ahora) {
            console.log('Date is too soon or has passed:', date, ahora);
            return res.status(400).send({ message: 'La fecha es muy próxima o ya ha pasado' });
        }

        const [horaInicioHoras, horaInicioMinutos] = data.timeStart.split(':').map(Number);
        const [horaFinHoras, horaFinMinutos] = data.timeEnd.split(':').map(Number);

        const minutosInicio = horaInicioHoras * 60 + horaInicioMinutos;
        const minutosFin = horaFinHoras * 60 + horaFinMinutos;

        if (minutosFin < minutosInicio) {
            return res.status(400).send({ message: 'No se puede finalizar un evento si no a terminado' });
        }
        // Asignar el tipo de voluntariado encontrado o creado
        data.typeOfVolunteering = typeOfVolunteering._id;

        let volunteering = new Volunteering(data);
        await volunteering.save();
        console.log('Volunteering registered:', volunteering);
        return res.send({ message: '¡El voluntariado se ha registrado con éxito!' });
    } catch (err) {
        console.error('Error while registering volunteering:', err);
        return res.status(500).send({ message: 'Error al registrar el voluntariado', err });
    }
};

// Asignarse a un voluntariado
export const assignVolunteering = async (req, res) => {
    try {
        const { volunteering: volunteeringId } = req.body; 
        const uid = req.user._id; 

        // Buscar el voluntariado por su ID
        const volunteering = await Volunteering.findById(volunteeringId);
        if (!volunteering) {
            console.log('No volunteering found for:', volunteeringId);
            return res.status(400).send({ message: 'No se ha encontrado ningún voluntariado' });
        }

        console.log('Volunteering found:', volunteering);

        // Verificar si el usuario ya está asignado a ese voluntariado específico
        const userAlreadyAssigned = volunteering.volunteers.includes(uid);
        if (userAlreadyAssigned) {
            console.log('User already assigned to volunteering:', uid, volunteering._id);
            return res.status(400).send({ message: 'Ya estas asignado a este voluntariado' });
        }

        // Verificar si se ha alcanzado la cuota máxima de voluntarios
        if (volunteering.volunteers.length >= volunteering.quota) {
            console.log('Volunteer quota reached for volunteering:', volunteering._id);
            return res.status(400).send({ message: 'Se ha alcanzado la cuota máxima de voluntarios' });
        }

        // Añadir al usuario a la lista de voluntarios del voluntariado
        volunteering.volunteers.push(uid);
        await volunteering.save();

        console.log('User assigned to volunteering:', uid, volunteering._id);
        return res.send({ message: '¡El usuario se ha asignado al voluntariado con éxito!' });

    } catch (error) {
        console.error('Error asignando voluntariado:', error);
        return res.status(500).send({ message: 'Error al asignarse al voluntariado', error });
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
        let data = await Volunteering.find().select('-__v')
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

        if(data.date){
            let cleanVolunters = await Volunteering.findById(id)
            cleanVolunters.volunteers = []
            await cleanVolunters.save();
        }
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

//actualizar estado

export const updateStatus = async (req, res) => {
    try {
        const actividades = await Volunteering.find().select('date timeStart timeEnd estado title');

        // Obtener la fecha y hora actual en la zona horaria de Guatemala
        const fechaActual = new Date(moment().tz('America/Guatemala').format('YYYY/MM/DD'))
        console.log(`La fecha actual es `, fechaActual)
        const horaActual = moment().tz('America/Guatemala').format('HH:mm');
        // Almacenar los resultados de las actualizaciones
        const resultadosActualizacion = [];

        // Recorrer todas las actividades y comparar las fechas
        for (const actividad of actividades) {
            const fechaActividad = new Date(actividad.date);

            if (fechaActividad > fechaActual) {
                // Obtener los datos completos de la actividad
                const actividadCompleta = await Volunteering.findById(actividad._id);
                // La actividad no ha comenzado
                if (actividadCompleta.estado !== 'Disponible') {
                    // Actualizar el estado de la actividad
                    const actividadActualizada = await Volunteering.findOneAndUpdate(
                        { _id: actividadCompleta._id },
                        { estado: 'Disponible' },
                        { new: true }
                    );
                    resultadosActualizacion.push(`Se ha actualizado ${actividadActualizada.title} a el estado ${actividadActualizada.estado}`);

                }
                console.log(`La actividad con fecha ${fechaActividad} y hora inicio ${actividad.timeStart} aun no ha comenzado.`);

            } else if (fechaActividad < fechaActual) {
                // Instrucciones si la fecha de la actividad es posterior a la fecha actual
                const actividadCompleta = await Volunteering.findById(actividad._id);

                // La actividad ya ha terminado
                if (actividadCompleta.estado !== 'Terminado') {
                    // Actualizar el estado de la actividad
                    const actividadActualizada = await Volunteering.findOneAndUpdate(
                        { _id: actividadCompleta._id },
                        { estado: 'Terminado' },
                        { new: true }

                    );

                    resultadosActualizacion.push(`Se ha actualizado ${actividadActualizada.title} a el estado ${actividadActualizada.estado}`);
                }

                // Guardar la informacion que hicieron el voluntariado a los usuarios en la base de datos
                for (const participant of actividadCompleta.volunteers) {
                    const participeUser = await User.findById(participant)

                    if (!Array.isArray(participeUser.volusTerminados)) {
                        participeUser.volusTerminados = [];
                        await participeUser.save()
                        console.log('ola')
                    }

                    

                    if (participeUser.volusTerminados.includes(actividadCompleta._id)) {
                        
                    } else {
                        participeUser.volusTerminados.push(actividadCompleta._id)
                        await participeUser.save()
                        console.log(`se guardo el voluntariado terminado al usuario ${participeUser.name}`)
                    }


                };

                //respuesta del servidor
                console.log(`La actividad con fecha ${fechaActividad} es posterior a la fecha actual.`);
            } else if (fechaActividad.getTime() == fechaActual.getTime()) {
                // Instrucciones si la fecha de la actividad es igual a la fecha actual
                const actividadCompleta = await Volunteering.findById(actividad._id);

                const fechaActividad = new Date(actividad.date);
                console.log('La fecha de la actividad es:', fechaActividad);
                // Comparar la hora de inicio
                const horaInicio = actividadCompleta.timeStart;
                const horaFin = actividadCompleta.timeEnd;
                console.log(`La actividad con fecha ${fechaActividad} es hoy.`);

                // Convertir las horas a minutos para facilitar la comparación
                const [horaInicioHoras, horaInicioMinutos] = horaInicio.split(':').map(Number);
                const [horaFinHoras, horaFinMinutos] = horaFin.split(':').map(Number);
                const [horaActualHoras, horaActualMinutos] = horaActual.split(':').map(Number);

                const minutosInicio = horaInicioHoras * 60 + horaInicioMinutos;
                const minutosFin = horaFinHoras * 60 + horaFinMinutos;
                const minutosActuales = horaActualHoras * 60 + horaActualMinutos;
                console.log("son las ", minutosActuales, " y la actividad es a las ", minutosInicio)
                console.log("son las ", minutosActuales, " y la actividad termina a las ", minutosFin)

                if (minutosActuales < minutosInicio) {
                    // La actividad aun no ha comenzado
                    const actividadCompleta = await Volunteering.findById(actividad._id);

                    if (actividadCompleta.estado !== 'Disponible') {
                        // Actualizar el estado de la actividad
                        const actividadActualizada = await Volunteering.findOneAndUpdate(
                            { _id: actividadCompleta._id },
                            { estado: 'Disponible' },
                            { new: true }
                        );
                        resultadosActualizacion.push(`Se ha actualizado ${actividadActualizada.title} a el estado ${actividadActualizada.estado}`);
                    }
                    console.log(`La actividad con fecha ${fechaActividad} y hora inicio ${actividad.timeStart} aun no ha comenzado.`);
                }
                else if (minutosActuales > minutosFin) {
                    // La actividad ya ha terminado
                    const actividadCompleta = await Volunteering.findById(actividad._id);

                    if (actividadCompleta.estado !== 'Terminado') {
                        // Actualizar el estado de la actividad
                        const actividadActualizada = await Volunteering.findOneAndUpdate(
                            { _id: actividadCompleta._id },
                            { estado: 'Terminado' },
                            { new: true }
                        );
                        resultadosActualizacion.push(`Se ha actualizado ${actividadActualizada.title} a el estado ${actividadActualizada.estado}`);

                        // Guardar la informacion que hicieron el voluntariado a los usuarios en la base de datos
                        for (const participant of actividadCompleta.volunteers) {
                            const participeUser = await User.findById(participant)

                            if (!Array.isArray(participeUser.volusTerminados)) {
                                participeUser.volusTerminados = [];
                                await participeUser.save()
                                console.log('ola')
                            }

                            if (participeUser.volusTerminados.includes(actividadCompleta._id)) {
                                
                            } else {
                                participeUser.volusTerminados.push(actividadCompleta._id)
                                await participeUser.save()
                            }


                        };

                    }

                    console.log(`La actividad con fecha ${fechaActividad} es posterior a la fecha actual.`);
                } else if (minutosActuales > minutosInicio && minutosActuales < minutosFin) {
                    // Actualizar el estado de la actividad
                    // Instrucciones si la fecha de la actividad es posterior a la fecha actual
                    const actividadCompleta = await Volunteering.findById(actividad._id);

                    // La actividad ya ha terminado
                    if (actividadCompleta.estado !== 'En Curso') {
                        // Actualizar el estado de la actividad
                        const actividadActualizada = await Volunteering.findOneAndUpdate(
                            { _id: actividadCompleta._id },
                            { estado: 'En Curso' },
                            { new: true }

                        );
                        resultadosActualizacion.push(`Se ha actualizado ${actividadActualizada.title} a el estado ${actividadActualizada.estado}`);
                    }

                    console.log(`La actividad con fecha ${fechaActividad} esta en curso.`);

                }

            }
            else {
                console.log('no jalo')
            }
        }

        // Responder con éxito y los resultados de las actualizaciones
        console.log({ message: 'Actualización completada', resultados: resultadosActualizacion });
    } catch (err) {
        console.error(err);
        console.log({ message: 'Error al obtener los mensajes' });
    }
};

export const findVolunteer = async (req, res) => {
    try {
        let { id } = req.params;
        console.log(id);
        let volunteer = await Volunteering.findById(id);
        return res.send({ volunteer });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error al obtener los datos del voluntariado' });
    }
}

// Listar voluntariados disponibles y en curso
export const listarVolunteeringDisponiblesEnCurso = async (req, res) => {
    const { organizationId } = req.body;
    if (!organizationId) {
        return res.status(400).json({ message: 'organizationId is required' });
    }
    try {
        const orgId = new mongoose.Types.ObjectId(organizationId);

        let data = await Volunteering.find({ 
            organization: orgId,
            estado: { $in: ['Disponible', 'En Curso'] }
        }).select('-__v').select('-_id'); 

        return res.status(200).send({ data });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'No se pudo obtener la información.' });
    }
};