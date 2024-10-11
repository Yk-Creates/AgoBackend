// routes/userRoutes.js

import express from "express";

import {
  addUser,
  calculateAmbulanceFare,
  calculateFareController,
  createAmbulanceOrder,
  createCabOrder,
  sos,
} from "../controllers/user.js";

const router = express.Router();

router.route("/add-user").post(addUser);

//get Ride Vehicles
// router.route("/vehicles/:categoryName").get(getVehiclesByCategory)

//get calculated fare with address
router.post("/cab/calculate-fare", calculateFareController);
router.post("/amb/calculate-fare", calculateAmbulanceFare);

//place ride order
router.post("/cab-order", createCabOrder);
router.post("/book-ambulance", createAmbulanceOrder);

//sos order
router.post("/amb/sos", sos);
export default router;
