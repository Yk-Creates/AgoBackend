const Driver = require('../models/driver'); // Adjust path as needed
import { Vehicle } from "../models/vehicle.js";



// Create a new driver
exports.createDriver = async (req, res) => {
    try {
        const { name, phone, email, carNo, carModel, carYear, drivingLicense, aadharCard, employmentType, password, vehicle, permit, fcm, clerk_id } = req.body;

        // Validate vehicle and permit
        const vehicleExists = await Vehicle.findById(vehicle);
        if (!vehicleExists) return res.status(400).json({ message: 'Vehicle not found' });

        const newDriver = new Driver({
            name,
            phone,
            email,
            carNo,
            carModel,
            carYear,
            drivingLicense,
            aadharCard,
            employmentType,
            password, // You should hash the password before saving
            vehicle,
            permit,
            fcm,
            clerk_id
        });

        await newDriver.save();
        res.status(201).json(newDriver);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all drivers
exports.getDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find().populate('vehicle');
        res.status(200).json(drivers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

