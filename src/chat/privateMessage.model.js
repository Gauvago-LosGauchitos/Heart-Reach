import mongoose from 'mongoose';

const privateMessageSchema = new mongoose.Schema({
    messages: [{
        username: { type: String, required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
    }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'organization', required: true }
});

export const PrivateMessage = mongoose.model('PrivateMessage', privateMessageSchema);