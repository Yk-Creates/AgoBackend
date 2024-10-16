import express from "express";

import {
  createVehicle,
  createVehicleCategory,
  getCategoriesWithVehicles,
} from "../controllers/category.js";
import {
  allotCabDriver,
  getAllAmbOrders,
  getAllCabOrders,
  getCabDrivers,
  getCabOrderById,
  getCabOrders,
  getDrivers,
  getVehiclesByCategory,
  unverifiedDrivers,
  updateOrderFare,
  updateVehiclePricePerKm,
  verifyDriver,
} from "../controllers/admin.js";

const router = express.Router();

// Route to create a new vehicle category
router.post("/new-category", createVehicleCategory);

//get all the categories
router.get("/categories", getCategoriesWithVehicles);

//create a new vehicle under a category
router.post("/new-vehicle", createVehicle);

//get all oders
router.get("/cab-orders", getAllCabOrders);
router.get("/amb-orders", getAllAmbOrders);

// Route to get vehicles by category
router.get("/category/:category", getVehiclesByCategory);

// Rou/categoryte to update the price per km for a specific vehicle
router.put("/:vehicleId/price", updateVehiclePricePerKm);

// driver Routes
router.get("/unverfied-driver", unverifiedDrivers);
router.post("/verify-driver", verifyDriver);
router.get("/get-drivers", getDrivers);
router.get("/get-cab-orders", getCabOrders);
router.get("/get-cab-drivers", getCabDrivers);
router.patch("/allot-cab-drivers", allotCabDriver);

// admin speacial routes
router.patch("/update-cab-fare", updateOrderFare);

// orders routes
router.post("/cab-order-id", getCabOrderById);
export default router;
