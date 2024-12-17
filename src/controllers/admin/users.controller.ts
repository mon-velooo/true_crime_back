import bcrypt from "bcryptjs";
import express, { Request, Response } from "express";
import * as roleService from "../../services/roles.service";
import * as service from "../../services/users.service";
import { excludeNonUpdatableFields } from "../../utils/excludeNonUpdatableFields";
import { extractSortsFromFilters } from "../../utils/extractSortsFromFilters";
import { ILike } from "typeorm";
import { extractPaginationFromFilters } from "../../utils/extractPaginationFromFilters";

const router = express.Router();
const isAdmin = true;

export interface UsersKpis {
  totalUsers: number;
  totalUsersActive: number;
  totalNewUsers: number;
}

export type UsersId = string[];

router.get("/", async (req: Request, res: Response) => {
  try {
    const where: any = {};
    const filters = req.query;
    const { page, limit, skip } = extractPaginationFromFilters(req);

    // Filter
    if (filters.fullname) {
      where.fullname = ILike(`%${filters.fullname}%`);
    }
    if (filters.roleId) {
      where.role = { id: filters.roleId };
    }
    if (filters.isConnected === "true" || filters.isConnected === "false") {
      where.isConnected = filters.isConnected.toUpperCase();
    }

    const sortableKey = [
      { paramsKey: "fullname", accessKey: "fullname" },
      { paramsKey: "isConnected", accessKey: "isConnected" },
      { paramsKey: "isArchived", accessKey: "isArchived" },
      { paramsKey: "role", accessKey: "role.label" },
    ];

    const { order } = extractSortsFromFilters(req, sortableKey);

    const { users, total } = await service.getPaginateUsers(
      where,
      skip,
      limit,
      order
    );

    const totalPages = Math.ceil(total / limit);

    res.status(200).send({ users, total, page, totalPages });
  } catch (error) {
    res.status(500).send({ error: "An error occurred" });
  }
});

router.get("/kpis", async (req: Request, res: Response) => {
  try {
    const users = await service.getUsers();

    const usersKpis: UsersKpis = {
      totalUsers: users.length,
      totalUsersActive: users.filter((user) => user.isConnected).length,
      totalNewUsers: users.filter(
        (user) => user.createdAt.getDate() === new Date().getDate()
      ).length,
    };

    res.status(200).send(usersKpis);
  } catch (error) {
    res.status(500).send({ error: "An error occurred" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const users = await service.getUserDetail(id, isAdmin);
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ error: "An error occurred" });
  }
});

router.patch("/archive", async (req: Request, res: Response) => {
  const ids: UsersId = req.body.usersId;
  try {
    for (const id of ids) {
      await service.updateUser(id, { isArchived: true }, isAdmin);
    }
    res.status(200).send({ success: "Users successfuly archived" });
  } catch (error) {
    res.status(500).send({ error: "An error occurred" });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  const fieldsToUpdate = excludeNonUpdatableFields(req.body, [
    "id",
    "password",
    "createdAt",
    "isConnected",
  ]);
  try {
    const updatedUser = await service.updateUser(id, fieldsToUpdate, isAdmin);
    res.status(200).send(updatedUser);
  } catch (error) {
    res
      .status(500)
      .send({ error: "An error occurred while updating the user." });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const role = await roleService.getRoleById(req.body.roleId);

    if (role === null) {
      throw new Error("Role doesn't exist");
    }

    userData.password = hashedPassword;
    userData.role = role;

    await service.createUser(userData);

    res.status(201).send({ success: "The account is successfully created" });
  } catch (error: any) {
    switch (error.code) {
      case "23505":
        error.message = "This email is already linked to an account";
        break;
      default:
        error.message = "An error occurred";
        break;
    }
    res.status(400).send({ error: error.message });
  }
});

export default router;
