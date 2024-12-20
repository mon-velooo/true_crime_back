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
import { Crime } from "./models/Crime";
import { Server } from "socket.io";
import http from "http";

const app = express();
const server = http.createServer(app); // Crée un serveur HTTP avec Express
const io = new Server(server); // Initialise Socket.IO avec le serveur HTTP

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
    await AppDataSource.initialize().then(async () => {
      console.log("DB connected");
      // Synchronize the database schema
      await AppDataSource.synchronize();
      console.info("Schema synchronized!");

      // Run migrations
      await AppDataSource.runMigrations();
      console.info("Migrations passed!");
    });

    // Configurer les WebSockets
    io.on("connection", (socket) => {
      console.log("Client connected to WebSocket");

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });

    // Start HTTP server
    server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });

    // Vérifier si la base de données est déjà peuplée
    const crimeCount = await AppDataSource.getRepository(Crime).count();
    if (crimeCount === 0) {
      console.log("Import data...");
      // Lancer la récupération et l'insertion des données
      client.connect();
      await fetchData().finally(() => {
        client.end();
        console.log("Data imported with success");
      });
    } else {
      console.log("Data already exists, skipping import.");
    }
  } catch (error) {
    console.log("DB connection failed");
    console.log(error);
  }
}

// Exporter io pour l'utiliser dans les contrôleurs
export { io };

// Call the bootstrap function to start the application
bootstrap();
