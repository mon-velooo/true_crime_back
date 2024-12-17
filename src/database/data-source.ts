import { DataSource } from "typeorm";
import { Role } from "../models/Role";
import { User } from "../models/User";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: true,
  logging: true,
  entities: [User, Role],
  subscribers: [],
  migrations: [],
});
