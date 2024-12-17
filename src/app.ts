// const io = require("socket.io")(4080, {
//   cors: {
//     origin: process.env.URL_FRONT || "localhost",
//     methods: ["GET", "POST"],
//     credentials: true,
//     allowedHeaders: ["Content-Type"],
//   },
// });

// let users = [];
// io.on("connection", (socket) => {
//   socket.on("addUser", async (userId) => {
//     const isUserExist = users.find((user) => user.userId === userId);
//     if (!isUserExist) {
//       const user = { userId, socketId: socket.id };
//       users.push(user);
//       io.emit("getUsers", users);
//     }
//   });
//   socket.on("disconnect", () => {
//     users = users.filter((user) => user.socketId !== socket.id);
//     io.emit("getUsers", users);
//     io.emit("disconnectUser");
//   });

//   socket.on("userDeleted", () => {
//     users = users.filter((user) => user.socketId !== socket.id);
//     io.emit("getUsersWhenOneDeleted", users);
//   });

//   socket.on("userCreatedOrUpdate", () => {
//     io.emit("getUsersWhenOneCreatedOrUpdate");
//   });
// });

import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import "reflect-metadata";
import { AppDataSource } from "./database/data-source";
import adminRouter from "./routes/admin.routes";
import userRouter from "./routes/user.routes";
import { authMiddleware } from "./middlewares/auth.middleware";
import { RoleEnum } from "./enums/RoleEnum";
import { fetchData, client } from "./database/insertData";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const port = process.env.PORT || 5001;

// Montez les routes des utilisateurs et des conversations sur votre application
app.use("/admin/api", authMiddleware({ roles: [RoleEnum.ADMIN] }), adminRouter);
app.use("/api", userRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).send({ message: "Something went wrong", error: err.message });
});

async function bootstrap(): Promise<void> {
  try {
    // Connexion à la base de donnée (Attente de la connexion avant de passer à la suite)
    await AppDataSource.initialize().then(() => {
      console.log("DB connected");
    });
    // Start Express server
    const server = app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
    console.log("Import data...")
    // Lancer la récupération et l'insertion des données
    client.connect();
    fetchData().finally(() => {
      client.end();
      console.log("Data imported with success")
    });
  } catch (error) {
    console.log("DB connexion failed");
    console.log(error);
  }
}

// Call the bootstrap function to start the application
bootstrap();
