'use strict'

import { Schema, model } from "mongoose"

const userSchema = Schema({
    name: {
        type: String,
        required: [true, 'Name is required.']
    },
    surname: {
        type: String,
        required: [true, 'Surname is required.']
    },
    dpi: {
        type: Number,
        minLength: [13, 'The DPI must be 13 digits long.'],
        maxLength: [13, 'The DPI must be 13 digits long.'],
        required: [true, 'DPI is required.']
    },
    username: {
        type: String,
        unique: [true, 'Username must be unique.'],
        lowercase: true,
        required: [true, 'Username is required.']
    },
    password: {
        type: String,
        minLength: [8, 'Password min must be 8 characters.'],
        required: [true, 'Password is required.']
    },
    email: {
        type: String,
        unique: [true, 'Email already exist.'],
        required: [true, 'Email is required.']
    },
    phone: {
        type: String,
        minLength: [8, 'The phone number must be 8 digits long.'],
        maxLength: [8, 'The phone number must be 8 digits long.'],
        required: [true, 'Phone is required.']
    },
    habilities: {
        type: String,
        maxLength: [200, 'The habilities must be 200 characters long'],
        required: false
    },
    imageProfile: {
        type: [String],
        required: false
    },
    role: {
        type: String,
        uppercase: true,
        enum: ['ADMIN', 'ADMIN-ASOCIATION', 'USER'],
        required: [true, 'Role is required.']
    },
    volusTerminados:{
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'volunteering',
        require: false
    }
})

export default model('user', userSchema);