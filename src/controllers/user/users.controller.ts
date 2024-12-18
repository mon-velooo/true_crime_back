import bcrypt from "bcryptjs";
import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import * as roleService from "../../services/roles.service";
import * as service from "../../services/users.service";
import { RoleEnum } from "../../enums/RoleEnum";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { excludeNonUpdatableFields } from "../../utils/excludeNonUpdatableFields";

const router = express.Router();

router.post("/signup", async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const role = await roleService.getRoleByLabel(RoleEnum.USER);

    if (role === null) {
      throw new Error("Role doesn't exist");
    }

    userData.password = hashedPassword;
    userData.role = role;

    await service.createUser(userData);

    res.status(201).send({ success: "Your account successfully created" });
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

router.post("/signin", async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    const user = await service.getUserByEmail(userData.email);

    if (user === null) {
      throw new Error("Bad credentials");
    }

    const verifyPassword = await bcrypt.compare(
      userData.password,
      user.password
    );

    if (!verifyPassword) {
      throw new Error("Bad credentials");
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role.label,
    };

    const JWT_SECRET = process.env.JWT_SECRET;

    console.log("JWT_SECRET", JWT_SECRET);

    if (JWT_SECRET === undefined || JWT_SECRET === null) {
      throw new Error("No JWT secret provide");
    }

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: 846000 });

    res.status(200).send({
      token,
      role: user.role.label,
      id: user.id,
    });
  } catch (error: any) {
    res.status(404).send({ error: error.message });
  }
});

router.get(
  "/me",
  authMiddleware({ roles: [RoleEnum.USER, RoleEnum.ADMIN] }),
  async (req: Request, res: Response) => {
    try {
      const id = req.userConnected?.id;
      if (!id) {
        return res.status(401).send({ error: "Not authorized" });
      }
      const user = await service.getUserDetail(id);
      if (!user) {
        res.status(404).send({ error: "User not found" });
      }
      res.status(200).send(user);
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  }
);

router.patch(
  "/me",
  authMiddleware({ roles: [RoleEnum.USER, RoleEnum.ADMIN] }),
  async (req: Request, res: Response) => {
    const id = req.userConnected?.id;
    if (!id) {
      return res.status(401).send({ error: "Not authorized" });
    }
    const fieldsToUpdate = excludeNonUpdatableFields(req.body, [
      "id",
      "password",
      "createdAt",
      "role",
    ]);
    try {
      const updatedUser = await service.updateUser(id, fieldsToUpdate);
      res.status(200).send(updatedUser);
    } catch (error) {
      res
        .status(500)
        .send({ error: "An error occurred while updating the user." });
    }
  }
);

/* router.get("/:id", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10); // Convertir en nombre
    const user = await service.getUserById(userId);
    if (user === undefined) {
      throw new Error("This user can't be found");
    }
    res.status(200).send(user);
  } catch (error: any) {
    res.status(404).send({ error: error.message });
  }
});



router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10); // Convertir en nombre
    const affectedRows = await service.deleteUserById(userId);
    if (affectedRows === 0) {
      throw new Error("This user can't be deleted");
    }
    res.status(200).send({ success: "Deleted successfully" });
  } catch (error: any) {
    res.status(404).send({ error: error.message });
  }
});


router.post("/sign-up", async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const hashedPassword = await bcrypt.hash(data.password, 10);

    if (!hashedPassword) {
      throw new Error();
    }

    data.password = hashedPassword;
    const affectedRows = await service.createUser(data);

    if (affectedRows === 0) {
      throw new Error("This user can't be added");
    }

    res.status(201).send({ success: "Votre compte à été créer avec succès" });
  } catch (error: any) { // Ajouter ': any' pour spécifier le type de 'error'
    if (error.message.includes("email_UNIQUE")) {
      error.message = "Cette adress email est déjà liée à un compte";
    }

    if (error.message.includes("full_name_UNIQUE")) {
      error.message = "Ce nom est déjà utilisé";
    }

    res.status(404).send({ error: error.message });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const id = parseInt(req.params.id, 10); // Convertir en nombre
    const user = await service.getUserById(id);

    console.log(data);

    if (user === undefined) {
      throw new Error("User not found");
    }

    let updatedData = { ...data };

    if (data.password) {
      const newHashedPassword = await bcrypt.hash(data.password, 10);

      if (newHashedPassword) {
        updatedData = { ...data, password: newHashedPassword };
      } else {
        throw new Error();
      }
    }

    const affectedRows = await service.updateUser(
      { ...user, ...updatedData },
      id
    );

    if (affectedRows === 0) {
      throw new Error("This user can't be updated");
    }

    res.status(200).send({ success: "User updated successfully" });
  } catch (error: any) {
    if (error.message.includes("email_UNIQUE")) {
      error.message = "Cette adress email est déjà liée à un compte";
    }

    if (error.message.includes("full_name_UNIQUE")) {
      error.message = "Ce nom est déjà utilisé";
    }

    res.status(404).send({ error: error.message });
  }
});


*/

export default router;
