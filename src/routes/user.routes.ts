import express from "express";
import crimesRoutes from "../controllers/user/crimes.controller";
import usersRoutes from "../controllers/user/users.controller";
import districtsRoutes from "../controllers/user/districts.controller";

const router = express.Router();

router.use("/users", usersRoutes);
router.use("/crimes", crimesRoutes);
router.use("/districts", districtsRoutes);

export default router;
