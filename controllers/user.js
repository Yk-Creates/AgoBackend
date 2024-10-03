// controllers/userController.js
import { CabOrder } from "../models/order.js";
import { User } from "../models/user.js";
import { Vehicle } from "../models/vehicle.js";
import { AmbulanceOrder } from "../models/amb-order.js";
import { getAddressFromCoordinates } from '../utils/geocoding.js';
import { Driver } from "../models/driver.js";

// const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const API_KEY = 'AIzaSyC8zy45f-dWZWg0P4A9mGAZjNlMYTnJRvI';

//register user
export const addUser = async (req, res) => {
  try {
    const { name, email, clerkId, phoneNo } = req.body;

    if (!name || !email || !clerkId || !phoneNo) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const user = await User.create({ name, email, clerkId, phoneNo });
    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// export const getVehiclesByCategory = async (req, res) => {
//   const { categoryName } = req.params;

//   try {
//       // Find the category by the provided name
//       const category = await VehicleCategory.findOne({ name: categoryName })
//           .populate({
//               path: 'vehicles',
//               select: 'name pricePerKm' // Only include name and pricePerKm fields
//           })
//           .exec();

//       if (!category) {
//           return res.status(404).json({ message: 'Category not found' });
//       }

//       // Send the list of vehicles
//       res.json(category.vehicles);
//   } catch (error) {
//       console.error('Error fetching vehicles:', error);
//       res.status(500).json({ message: 'Server error' });
//   }
// };


const fetchTravelDistance = async (startLat, startLong, endLat, endLong) => {
  const origin = `${startLat},${startLong}`;
  const destination = `${endLat},${endLong}`;
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("Google Maps API response:", data); // Log API response for debugging

    if (data.status === 'REQUEST_DENIED') {
      throw new Error(`Google Maps API error: ${data.error_message}`);
    }

    if (data.routes.length > 0) {
      const route = data.routes[0];
      if (route && route.legs.length > 0) {
        const leg = route.legs[0];
        return {
          distance: leg.distance.value / 1000, // Convert meters to kilometers
          duration: leg.duration.text
        };
      }
    }
    throw new Error('No route found');
  } catch (error) {
    console.error('Error fetching directions:', error);
    throw new Error('Failed to fetch travel distance');
  }
};

//select vehicle page , with fare and distance
export const calculateFareController = async (req, res) => {
  const { startLat, startLong, endLat, endLong } = req.body;

  try {
    // Step 1: Get the travel distance and duration using the fetchTravelDistance function
    const { distance, duration } = await fetchTravelDistance(startLat, startLong, endLat, endLong);
    console.log('Distance and duration:', { distance, duration }); // Log distance and duration

    // Step 2: Get the start and end addresses using the utility function
    const [startAddress, endAddress] = await Promise.all([
      getAddressFromCoordinates(startLat, startLong),
      getAddressFromCoordinates(endLat, endLong),
    ]);
    console.log('Addresses:', { startAddress, endAddress }); // Log addresses

    // Step 3: Fetch all vehicles and calculate the fare for each
    const vehicles = await Vehicle.find();
    if (!vehicles.length) {
      throw new Error('No vehicles found');
    }
    console.log('Vehicles:', vehicles); // Log vehicles

    const fares = vehicles.map(vehicle => ({
      vehicle: vehicle.name,
      fare: (distance * vehicle.pricePerKm).toFixed(2), // Format fare to 2 decimal places
    }));
    console.log('Fares:', fares); // Log fares

    // Step 4: Send the response
    res.json({
      startAddress,
      endAddress,
      distance: `${distance.toFixed(2)} km`, // Format distance to 2 decimal places
      duration,
      fares,
    });
  } catch (error) {
    console.error('Error in calculateFareController:', error.message); // Log detailed error
    res.status(500).json({ error: 'Failed to calculate fare', details: error.message });
  }
};

//book a cab
export const createCabOrder = async (req, res) => {
    try {
      const { clerkId, start, end, date, time, fare, vehicle } = req.body;

      // Check if the user with the provided clerkId exists
      const user = await User.findOne({ clerkId });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create a new cab order with the vehicle as a string
      const newOrder = new CabOrder({
        user: user._id, // Use the ObjectId of the user
        start: {
          latitude: start.latitude,
          longitude: start.longitude,
        },
        end: {
          latitude: end.latitude,
          longitude: end.longitude,
        },
        date,
        time,
        fare,
        vehicle,
      });

      // Save the new order to the database
      await newOrder.save();

      // Respond with the created order
      return res.status(201).json({
        message: "Cab order created successfully",
        order: newOrder,
      });
    } catch (error) {
      console.error("Error creating cab order:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };


  //Ambulance apis
  export const calculateAmbulanceFare = async (req, res) => {
    const { startLat, startLong, endLat, endLong } = req.body;

    try {
      // Step 1: Get the travel distance and duration
      const { distance, duration } = await fetchTravelDistance(startLat, startLong, endLat, endLong);
      console.log('Distance and duration:', { distance, duration }); // Log distance and duration

      // Step 2: Get the start and end addresses using the utility function
      const [startAddress, endAddress] = await Promise.all([
        getAddressFromCoordinates(startLat, startLong),
        getAddressFromCoordinates(endLat, endLong),
      ]);
      console.log('Addresses:', { startAddress, endAddress }); // Log addresses

      // Step 3: Fetch all vehicles in the "Ambulance" category and calculate the fare for each
      const vehicles = await Vehicle.find({ category: 'Ambulance' });
      if (!vehicles.length) {
        throw new Error('No ambulance vehicles found');
      }
      console.log('Ambulance Vehicles:', vehicles); // Log vehicles

      const fares = vehicles.map(vehicle => ({
        vehicle: vehicle.name,
        fare: (distance * vehicle.pricePerKm).toFixed(2), // Format fare to 2 decimal places
      }));
      console.log('Fares:', fares); // Log fares

      // Step 4: Send the response
      res.json({
        startAddress,
        endAddress,
        distance: `${distance.toFixed(2)} km`, // Format distance to 2 decimal places
        duration,
        fares,
      });
    } catch (error) {
      console.error('Error in calculateFareController:', error.message); // Log detailed error
      res.status(500).json({ error: 'Failed to calculate fare', details: error.message });
    }
  };

  //book an ambulance
  export const createAmbulanceOrder = async (req, res) => {
    try {
      const { clerkId, start, end, date, time, fare, vehicle } = req.body;

      // Check if the user with the provided clerkId exists
      const user = await User.findOne({ clerkId });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const newOrder = new AmbulanceOrder({
        user: user._id,
        start: {
          latitude: start.latitude,
          longitude: start.longitude,
        },
        end: {
          latitude: end.latitude,
          longitude: end.longitude,
        },
        date,
        time,
        fare,
        vehicle,
      });
      await newOrder.save();
      return res.status(201).json({
        message: "Ambulance order created successfully",
        order: newOrder,
      });
    } catch (error) {
      console.error("Error creating ambulance order:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  //sos api
  export const sos = async (req, res) => {
    try {
        // Destructure data from request body
        const { clerkId ,currentLat, currentLong, date, time, vehicle = "Basic Life Support" } = req.body;

        const user = await User.findOne({ clerkId });
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        const driver = await Driver.findOne({
            vehicle: "Basic Life Support",
            status: true // Active driver
        }).sort({ updatedAt: -1 }); // Sort by most recently updated driver

        if (!driver) {
            return res.status(404).json({ error: "No active driver with 'Basic Life Support' available" });
        }

        // Create the ambulance order
        const ambulanceOrder = new AmbulanceOrder({
            user: user._id,
            start: {
                latitude: currentLat,
                longitude: currentLong,
            },
            end: {
                latitude: currentLat,       // Same as start
                longitude: currentLong,     // Same as start
            },
            driver: driver._id,
            vehicle,
            status: "SOS",
            date,
            time,
        });

        // Save the order
        await ambulanceOrder.save();

        // Send success response
        return res.status(201).json({
            message: "SOS request for ambulance has been created successfully",
            order: ambulanceOrder
        });
    } catch (error) {
        console.error("Error creating SOS Ambulance order:", error);
        return res.status(500).json({ error: "Server error while processing SOS request" });
    }
};
