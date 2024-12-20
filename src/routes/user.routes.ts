import express from "express";
import crimesRoutes from "../controllers/user/crimes.controller";
import usersRoutes from "../controllers/user/users.controller";
import districtsRoutes from "../controllers/user/districts.controller";
import kpiRoutes from "../controllers/user/kpis.controller";
import graphsRoutes from "../controllers/user/graphs.controller";
import reportingsRoutes from "../controllers/user/reportings.controller";

const router = express.Router();

router.use("/users", usersRoutes);
router.use("/crimes", crimesRoutes);
router.use("/districts", districtsRoutes);
router.use("/kpis", kpiRoutes);
router.use("/graphs", graphsRoutes);
router.use("/reportings", reportingsRoutes);

export default router;
