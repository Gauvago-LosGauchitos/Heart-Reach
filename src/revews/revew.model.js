import { Schema, model } from "mongoose";

const revewORG = Schema({
    review: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        enum: [1, 2, 3, 4, 5]
    },
    created: {
        type: Date,
        default: Date.now
    },
    userR: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    organizationR: {
        type: Schema.Types.ObjectId,
        ref: 'organization'
    }
}, {
    versionKey: false
});

export default model('revewORG', revewORG);
