import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    pricePerKm: {
        type: Number,
        required: true
    },
}, { timestamps: true });

export const Vehicle = mongoose.model('Vehicle', vehicleSchema);
