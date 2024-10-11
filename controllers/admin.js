import { Driver } from "../models/driver.js";
import { CabOrder } from "../models/order.js";
import { AmbulanceOrder } from "../models/amb-order.js";
import { User } from "../models/user.js";
import { getAddressFromCoordinates } from "../utils/geocoding.js";
import { Vehicle } from "../models/vehicle.js";
import { VehicleCategory } from "../models/vehicleCategory.js";

// Get all drivers
export const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({});
    res.status(200).json({
      success: true,
      data: drivers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve drivers",
      error: error.message,
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
        message: "Driver not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Driver has been blocked successfully",
      data: driver,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to block driver",
      error: error.message,
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
      return res
        .status(400)
        .json({ message: "Ride order cannot be cancelled" });
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
        path: "user",
        select: "name email phoneNo clerkId",
        model: User,
      })
      .exec();

    // Map over each order and fetch the start and end addresses
    const ordersWithAddresses = await Promise.all(
      orders.map(async (order) => {
        const startAddress = await getAddressFromCoordinates(
          order.start.latitude,
          order.start.longitude
        );
        const endAddress = await getAddressFromCoordinates(
          order.end.latitude,
          order.end.longitude
        );

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
    console.error("Error fetching ambulance orders:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching ambulance orders." });
  }
};

//get all ambulance orders
export const getAllAmbOrders = async (req, res) => {
  try {
    // Fetch all ambulance orders and populate the user field with user details
    const orders = await AmbulanceOrder.find()
      .populate({
        path: "user",
        select: "name email phoneNo clerkId", // Fields to include from the User model
        model: User,
      })
      .exec();

    // Map over each order and fetch the start and end addresses
    const ordersWithAddresses = await Promise.all(
      orders.map(async (order) => {
        const startAddress = await getAddressFromCoordinates(
          order.start.latitude,
          order.start.longitude
        );
        const endAddress = await getAddressFromCoordinates(
          order.end.latitude,
          order.end.longitude
        );

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
    console.error("Error fetching ambulance orders:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching ambulance orders." });
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
      return res
        .status(400)
        .json({ message: "Only requested orders can be accepted" });
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

// Function to get all vehicles by category
export const getVehiclesByCategory = async (req, res) => {
  const { category } = req.params; // Category passed in as a route parameter

  try {
    // Find the category and populate the vehicles associated with it
    const vehicleCategory = await VehicleCategory.findOne({
      name: category,
    }).populate("vehicles");

    if (!vehicleCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json(vehicleCategory.vehicles); // Return the vehicles under this category
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Function to update the price per km for a specific vehicle
export const updateVehiclePricePerKm = async (req, res) => {
  const { vehicleId } = req.params; // Vehicle ID passed in as a route parameter
  const { newPrice } = req.body; // The new price per km passed in the request body

  if (!newPrice || newPrice <= 0) {
    return res.status(400).json({ message: "Please provide a valid price" });
  }

  try {
    // Find the vehicle by ID
    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Update the price per km
    vehicle.pricePerKm = newPrice;
    await vehicle.save(); // Save the updated vehicle

    return res.status(200).json({
      message: `Price for vehicle ${vehicle.name} updated to ${newPrice} per km`,
      vehicle,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const unverifiedDrivers = async (req, res) => {
  try {
    // Fetch drivers who are not verified
    const unverifiedDrivers = await Driver.find({ isVerfied: false });

    // Return the list of unverified drivers
    return res.status(200).json({
      success: true,
      message: "List of unverified drivers",
      data: unverifiedDrivers,
    });
  } catch (error) {
    // Handle any errors during the process
    return res.status(500).json({
      success: false,
      message: "Failed to fetch unverified drivers",
      error: error.message,
    });
  }
};

export const verifyDriver = async (req, res) => {
  try {
    // Get driver ID from the request body
    const { driverId } = req.body;

    // Check if driverId is provided
    if (!driverId) {
      return res.status(400).json({
        success: false,
        message: "Driver ID is required",
      });
    }

    // Find the driver by ID and update their 'isVerfied' status to true
    const driver = await Driver.findByIdAndUpdate(
      driverId,
      { isVerfied: true },
      { new: true } // Return the updated driver document
    );

    // If driver not found
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    // Return success message with the updated driver data
    return res.status(200).json({
      success: true,
      message: "Driver verified successfully",
      data: driver,
    });
  } catch (error) {
    // Handle any errors
    return res.status(500).json({
      success: false,
      message: "Failed to verify driver",
      error: error.message,
    });
  }
};

export const getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find();
    return res.status(200).json({
      message: "Drivers fetched successfully",
      drivers,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to fetch drivers",
      error: error.message,
    });
  }
};

export const getCabOrders = async (req, res) => {
  try {
    // Fetch cab orders with populated user data
    const orders = await CabOrder.find()
      .populate({
        path: "user",
        select: "name email phoneNo",
        model: User, // Ensure User model is passed here
      })
      .sort({ createdAt: -1 });

    // Return orders in the response
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching cab orders:", error);

    // Send an error response with appropriate status code and message
    res.status(500).json({ error: "Failed to fetch cab orders" });
  }
};

export const getCabDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({
      isVerfied: true,
      category: "Ride",
      status: true,
    });
    return res.status(200).json({
      message: "Drivers fetched successfully",
      drivers,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to fetch drivers",
      error: error.message,
    });
  }
};

export const allotCabDriver = async (req, res) => {
  try {
    const { orderId, driverId } = req.body;
    const order = await CabOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    order.driver = driverId;
    await order.save();
    return res.status(200).json({ message: "Driver assigned successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
