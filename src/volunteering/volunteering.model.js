import mongoose from "mongoose";

const volunteeringSchema = new mongoose.Schema({

    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organization',
        required: [true, 'organization required']
    },

    title: {
        type: String,
        required: [true, 'Title is required'],
        minlength: [5, 'Title must be at least 5 characters long'],
        maxlength: [100, 'Title cannot exceed 100 characters']

    },

    typeOfVolunteering: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TypeOfVolunteering',
        required: [true, 'El tipo de voluntariado es obligatorio']
    },

    description: {
        type: String,
        required: [true, 'Description is required'],
        minlength: [10, 'Description must be at least 10 characters long'],
        maxlength: [150, 'Description cannot exceed 150 characters']
    },

    location: {
        type: String,
        required: [true, 'Location is required'],
        minlength: [5, 'Location must be at least 5 characters long'],
        maxlength: [100, 'Location cannot exceed 100 characters']
    },

    date: {
        type: String,
        default: Date.now,
        required: true
    },

    timeStart: {
        type: String,
        required: [true, 'Time start is required'],
    },

    timeEnd: {
        type: String,
        required: [true, 'Time end is required'],
    },

    imageVol: {
        type: [String],
        required: false
    },

    quota: {
        type: Number,
        required: [true, 'Quota is required'],
        min: [1, 'Quota must be at least 1'],
        max: [20, 'Quota cannot exceed 20']
    },

    estado: {
        type: String,
        enum: ['Disponible', 'Terminado', 'En Curso'],
        default: 'Disponible',
        required: [true, 'estado is required'],
    }


})

export default mongoose.model('volunteering', volunteeringSchema);