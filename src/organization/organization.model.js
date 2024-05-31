'use strict'

import { Schema, model } from "mongoose"

const organizationSchema = Schema({
    name: {
        type: String,
        required: [true, 'Name is required.']
    },
    description: {
        type: String,
        required: [true, 'Email is required.']
    },
    address: {
        type: String,
        required: [true, 'Address is required.']
    },
    phone: {
        type: String,
        minLength: [8, 'The phone number must be 8 digits long.'],
        maxLength: [8, 'The phone number must be 8 digits long.'],
        required: [true, 'Phone is required.']
    },
    images: {
        type: [String],
        required: false
    },
    role: {
        type: String,
        uppercase: true,
        enum: ['ACEPTADO', 'EN ESPERA', 'DENEGADO'],
        default: 'EN ESPERA',
        required: [true, 'Role is required.']
    }
})

export default model('organization', organizationSchema);