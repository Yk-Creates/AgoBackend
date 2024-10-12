import { Vehicle } from "../models/vehicle.js";
import { VehicleCategory } from "../models/vehicleCategory.js";

const ensureCategoryExists = async (categoryName) => {
  let category = await VehicleCategory.findOne({ name: categoryName });
  if (!category) {
    category = new VehicleCategory({
      name: categoryName,
      vehicles: [], // Initially empty
    });
    await category.save();
  }
  return category;
};

export const createVehicleCategory = async (req, res) => {
  try {
    const { name } = req.body;

    // Check if category already exists
    const existingCategory = await VehicleCategory.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    // Create the VehicleCategory
    const vehicleCategory = new VehicleCategory({ name });

    await vehicleCategory.save();

    res.status(201).json(vehicleCategory);
  } catch (error) {
    res.status(500).json({ message: "Error creating vehicle category", error });
  }
};

export const getCategoriesWithVehicles = async (req, res) => {
  try {
    const categories = await VehicleCategory.find()
      .populate({
        path: "vehicles",
        select: "name pricePerKm",
      })
      .exec();

    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch categories with vehicles" });
  }
};

export const createVehicle = async (req, res) => {
  try {
    const { name, category, pricePerKm } = req.body;
    console.log(name, category, pricePerKm);
    // Ensure the category exists and get the category document
    const categoryDoc = await ensureCategoryExists(category);

    // Check if the vehicle already exists in the category
    const existingVehicle = await Vehicle.findOne({
      name,
      category: categoryDoc.name,
    });
    if (existingVehicle) {
      return res
        .status(400)
        .json({ message: "Vehicle already exists in this category" });
    }

    const vehicle = new Vehicle({
      name,
      category: categoryDoc.name, // Save category as string
      pricePerKm,
    });

    await vehicle.save();

    // Update the VehicleCategory document to include the new vehicle
    await VehicleCategory.updateOne(
      { _id: categoryDoc._id },
      { $push: { vehicles: vehicle._id } }
    );

    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: "Error creating vehicle", error });
  }
};
