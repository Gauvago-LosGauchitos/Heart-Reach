import Volunteering from "./volunteering.model.js"
import { checkUpdateV } from "../utils/validator.js"
import mongoose from 'mongoose';

//testeo
export const test = (req, res)=>{
    console.log('test is running')
    return res.send({message: 'Test is running'})
}

//Register
export const registerV = async (req, res) => {
    try {
        let data = req.body;
        const existingVolunteering = await Volunteering.findOne({ nameVolunteering: data.nameVolunteering });
        if (existingVolunteering) {
            return res.status(400).send({ message: 'Volunteering already exists' });
        }
        let volunteering = new Volunteering(data);
        await volunteering.save()
        return res.send({ message: '¡The Volunteering has been successfully registered!' });
    } catch (err) {
        return res.status(500).send({ message: 'Error registering the Volunteering', err: err });
    }
}

export const addType = async (req, res) => {
    try {
        let {added} = req.body;
        
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
export const deleteV = async(req, res)=>{
    try {
        let { id } = req.params;
        if (!id) {
            return res.status(400).send({ message: 'ID is required' });
        }
        let deletedVolunteering = await Volunteering.findOneAndDelete({_id: id});
        if(!deletedVolunteering) return res.status(404).send({message: 'Volunteering no encontrada y no eliminada'}); 
        return res.send({message: `Volunteering con nombre  ${deletedVolunteering.title} eliminado exitosamente`});
    } catch (err) {
        console.error(err);
        return res.status(500).send({message: 'Error al eliminar a Volunteering'});
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
    try{
        let {id} = req.params
        let data = req.body
        let update = checkUpdateV(data, id)
        if(!update) return res.status .send({message: `Volunteering actualizado exitososamente`})
        let  updateVolunteering = await Volunteering.findOneAndUpdate(
            {_id: id},
            data,
            {new: true}
        )
        if(!updateVolunteering) return res.status(404).send({ message: `Volunteering c no encontrado`})
        return res.send({message: `Volunteering actualizado exitoso`})
    }   catch(error){
        console.error(error);
        return res.status(500).send({message: 'Error al actualizar Volunteering', error: error.message})
    }     
}

