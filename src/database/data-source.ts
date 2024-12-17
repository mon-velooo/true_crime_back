import { DataSource } from "typeorm";
import { Role } from "../models/Role";
import { User } from "../models/User";
import { District } from "../models/District";
import { Gender } from "../models/Gender";
import { Person } from "../models/Person";
import { LawCategory } from "../models/LawCategory";
import { LocationDescription } from "../models/LocationDescription";
import { LocationType } from "../models/LocationType";
import { Status } from "../models/Status";
import { AgeGroup } from "../models/AgeGroup";
import { Crime } from "../models/Crime";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: true,
  logging: true,
  entities: [
    AgeGroup,
    Crime,
    District,
    Gender,
    Person,
    LawCategory,
    LocationDescription,
    LocationType,
    Role,
    Status,
    User,
  ],
  subscribers: [],
  migrations: [],
});
