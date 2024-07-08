import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
    username: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    chatRoom: { type: mongoose.Schema.Types.ObjectId, 
        ref: 'volunteering', 
        required: true 
    } 
})

export const Message = mongoose.model('Message', messageSchema)
