import mongoose from "mongoose"

const userSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    surname:{
        type: String,
        required: true
    },
    username:{
        type: String,
        unique: true,
        required: true
    },
    DPI:{
        type: Number,
        minLength: 13,
        maxLength: 13,
        unique: true,
        required: true
    },
    address:{
        type: String,
        required: true
    },
    phone:{
        type: Number,
        minLength: 8,
        maxLength: 8,
        required: true
    },
    email:{
        type: String,
        unique: true,
        required: true
    },
    password:{
        type: String,
        minLength: [8, 'Password must be 8 characters'],
        required: true
    },
    role:{
        type: String,
        uppercase: true,
        enum: ['USER', 'ADMIN', 'ADMIN_ORGANIZATION'],
        required: true
    }
})

export default mongoose.model('user', userSchema)