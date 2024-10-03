
import  {Driver}  from "../models/driver.js"
import { CabOrder } from "../models/order.js";
import { AmbulanceOrder } from "../models/amb-order.js";
import { User } from '../models/user.js';
import { getAddressFromCoordinates } from '../utils/geocoding.js';


// Get all drivers
export const getAllDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find({});
        res.status(200).json({
            success: true,
            data: drivers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve drivers',
            error: error.message
        });
    }
};

// Block a driver by ID
export const blockDriver = async (req, res) => {
    try {
        const { driverId } = req.params;

        // Find the driver by ID and update the 'blocked' status
        const driver = await Driver.findByIdAndUpdate(
            driverId,
            { blocked: true },
            { new: true } // Returns the updated document
        );

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Driver has been blocked successfully',
            data: driver
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to block driver',
            error: error.message
        });
    }
};

// Controller to cancel a ride order
export const cancelRideOrder = async (req, res) => {
    try {
      const { orderId } = req.body;

      // Find the order by ID
      const order = await CabOrder.findById(orderId);

      if (!order) {
        return res.status(404).json({ message: "Ride order not found" });
      }

      // Check if the order status is "REQUESTED" or "ACCEPTED"
      if (order.status !== "REQUESTED" && order.status !== "ACCEPTED") {
        return res.status(400).json({ message: "Ride order cannot be cancelled" });
      }

      // Change the status to "CANCELLED"
      order.status = "CANCELLED";

      // Save the updated order
      await order.save();

      return res.status(200).json({
        message: "Ride order cancelled",
        order,
      });
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  };

//get all cab orders with string addreess
export const getAllCabOrders = async (req, res) => {
    try {
      // Fetch all ambulance orders and populate the user field with user details
      const orders = await CabOrder.find()
        .populate({
          path: 'user',
          select: 'name email phoneNo clerkId', // Fields to include from the User model
          model: User,
        })
        .exec();

      // Map over each order and fetch the start and end addresses
      const ordersWithAddresses = await Promise.all(
        orders.map(async (order) => {
          const startAddress = await getAddressFromCoordinates(order.start.latitude, order.start.longitude);
          const endAddress = await getAddressFromCoordinates(order.end.latitude, order.end.longitude);

          return {
            ...order.toObject(), // Convert mongoose document to plain JS object
            startAddress,
            endAddress,
          };
        })
      );

      // Respond with the orders including user details and addresses
      res.json(ordersWithAddresses);
    } catch (error) {
      console.error('Error fetching ambulance orders:', error);
      res.status(500).json({ message: 'An error occurred while fetching ambulance orders.' });
    }
  };

  //get all ambulance orders
export const getAllAmbOrders = async (req, res) => {
    try {
      // Fetch all ambulance orders and populate the user field with user details
      const orders = await AmbulanceOrder.find()
        .populate({
          path: 'user',
          select: 'name email phoneNo clerkId', // Fields to include from the User model
          model: User,
        })
        .exec();

      // Map over each order and fetch the start and end addresses
      const ordersWithAddresses = await Promise.all(
        orders.map(async (order) => {
          const startAddress = await getAddressFromCoordinates(order.start.latitude, order.start.longitude);
          const endAddress = await getAddressFromCoordinates(order.end.latitude, order.end.longitude);

          return {
            ...order.toObject(), // Convert mongoose document to plain JS object
            startAddress,
            endAddress,
          };
        })
      );

      // Respond with the orders including user details and addresses
      res.json(ordersWithAddresses);
    } catch (error) {
      console.error('Error fetching ambulance orders:', error);
      res.status(500).json({ message: 'An error occurred while fetching ambulance orders.' });
    }
  };

  //accept ambulance order
  export const acceptAmbulanceOrder = async (req, res) => {
    try {
        const { orderId } = req.body;

        // Find the ambulance order by ID
        const order = await AmbulanceOrder.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Ambulance order not found" });
        }

        // Check if the order status is "REQUESTED"
        if (order.status !== "REQUESTED") {
            return res.status(400).json({ message: "Only requested orders can be accepted" });
        }

        // Change the status to "ACCEPTED"
        order.status = "ACCEPTED";

        // Save the updated order
        await order.save();

        return res.status(200).json({
            message: "Ambulance order accepted",
            order,
        });
    } catch (error) {
        console.error("Error accepting ambulance order:", error);
        return res.status(500).json({ message: "Server error", error });
    }
};
