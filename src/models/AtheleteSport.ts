import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Athlete } from "./Athlete";
import { Medal } from "./Medal";
import { Sport } from "./Sport";

@Entity()
export class AthleteSport {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Athlete, (athlete) => athlete.athleteSports)
  athlete: Athlete;

  @ManyToOne(() => Sport, (sport) => sport.athleteSports)
  sport: Sport;

  @ManyToOne(() => Medal, (medal) => medal.athleteSports)
  medalType: Medal;
}
