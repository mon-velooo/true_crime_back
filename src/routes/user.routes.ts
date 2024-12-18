import express from "express";
import crimesRoutes from "../controllers/user/crimes.controller";
import usersRoutes from "../controllers/user/users.controller";
import districtsRoutes from "../controllers/user/districts.controller";
import kpiRoutes from "../controllers/user/kpi.controller";

const router = express.Router();

router.use("/users", usersRoutes);
router.use("/crimes", crimesRoutes);
router.use("/districts", districtsRoutes);
router.use("/kpi", kpiRoutes);

export default router;
