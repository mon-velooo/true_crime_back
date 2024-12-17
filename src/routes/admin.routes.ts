import express from "express";
import rolesRoutes from "../controllers/admin/roles.controller";
import usersRoutes from "../controllers/admin/users.controller";

const router = express.Router();

router.use("/roles", rolesRoutes);
router.use("/users", usersRoutes);

export default router;
