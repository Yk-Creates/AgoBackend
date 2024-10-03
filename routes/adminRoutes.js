import express from "express";

import { createVehicle, createVehicleCategory, getCategoriesWithVehicles } from '../controllers/category.js';
import { getAllAmbOrders, getAllCabOrders } from "../controllers/admin.js";


const router = express.Router();


// Route to create a new vehicle category
router.post('/new-category', createVehicleCategory);

//get all the categories
router.get('/categories', getCategoriesWithVehicles);

//create a new vehicle under a category
router.post('/new-vehicle', createVehicle);

//get all oders 
router.get('/cab-orders', getAllCabOrders);
router.get('/amb-orders' , getAllAmbOrders);

export default router;
