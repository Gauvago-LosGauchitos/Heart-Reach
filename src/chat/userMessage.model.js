import mongoose from 'mongoose';

const userMessageSchema = new mongoose.Schema({
    messages: [{ 
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
    }],
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }
});

export const UserMessage = mongoose.model('UserMessage', userMessageSchema);