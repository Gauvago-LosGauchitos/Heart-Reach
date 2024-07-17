import mongoose from "mongoose";

const typeOfVolunteeringSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    unique: true,
    uppercase: true
  }
});

export default mongoose.model('TypeOfVolunteering', typeOfVolunteeringSchema);
