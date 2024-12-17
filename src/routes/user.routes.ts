import express from "express";
import crimesRoutes from "../controllers/user/crimes.controller";
import usersRoutes from "../controllers/user/users.controller";

const router = express.Router();

router.use("/users", usersRoutes);
router.use("/crimes", crimesRoutes);

export default router;
