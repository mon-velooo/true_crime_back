import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from "typeorm";
import { GenderEnum } from "../enums/GenderEnum";
import { Country } from "./Country";
import { AthleteSport } from "./AtheleteSport";
import { Participation } from "./Participation";
import { Like } from "./Like";

@Entity()
export class Crime {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "date" })
  start_date: string;

  @Column({ type: "time", precision: 0 })
  start_time: string;

  @Column({ type: "date" })
  end_date: string;

  @Column({ type: "time", precision: 0 })
  end_time: string;

  @Column({ type: "double precision" })
  latitude: number;

  @Column({ type: "double precision" })
  longitude: number;

  @Column({ type: "text" })
  description: string;
}
