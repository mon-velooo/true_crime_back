import express from "express";
import athletesRoutes from "../controllers/user/athletes.controller";
import usersRoutes from "../controllers/user/users.controller";
import sportsRoute from "../controllers/user/sports.controller";

const router = express.Router();

router.use("/users", usersRoutes);
router.use("/athletes", athletesRoutes);
router.use("/sports", sportsRoute);

export default router;
