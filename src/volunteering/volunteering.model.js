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

    TypeOfVolunteering: {
        type: String,
        required: [true, 'Type of volunteering required']
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
        type: Date,
        default: Date.now,
        required: true
    },
    
    quota: {
        type: Number,
        required: [true, 'Quota is required'],
        min: [1, 'Quota must be at least 1'],
        max: [20, 'Quota cannot exceed 20']
    }

})

export default mongoose.model('volunteering', volunteeringSchema);