import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { RoleEnum } from "../enums/RoleEnum";
import * as service from "../services/users.service";

/* If no roles is passed to the authMiddleware all roles are accepted for authorization */
export const authMiddleware = ({ selfOnly = false, roles }: { selfOnly?: boolean, roles?: RoleEnum[] } = {}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Format token because we receive "Bearer token"
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Missing authorization token" });
    }

    try {
      // Decode token
      const JWT_SECRET = process.env.JWT_SECRET;

      if (JWT_SECRET === undefined || JWT_SECRET === null) {
        throw new Error("No JWT secret provide");
      }

      const decodedToken = jwt.verify(token, JWT_SECRET);

      if (typeof decodedToken === "string") {
        throw new Error("Invalid token");
      }

      // Get connected user
      const user = await service.getUserById(decodedToken.userId);

      if (user === null) {
        throw new Error("No user found");
      }

      // Verify roles if necessary
      if (roles && roles.length > 0) {
        if (!roles.includes(user.role.label)) {
          throw new Error("Roles not authorized");
        }
      }

      // Restrict access to self if selfOnly is true
      if (selfOnly) {
        const id = req.params.id;
        if (user.id !== id && user.role.label !== RoleEnum.ADMIN) {
          return res.status(403).json({ error: "Forbidden" });
        }
      }

      // Return User actually connected that perform the request
      req.userConnected = user;
      next();
    } catch (error: any) {
      console.log(error.message);
      return res.status(401).json({ message: "Not authorized" });
    }
  };
};
