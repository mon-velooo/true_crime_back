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
import { Event } from "./Event";

@Entity()
export class Participation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: "int", nullable: true })
  position: number;

  @ManyToOne(() => Athlete, (athlete) => athlete.participations)
  athlete: Athlete;

  @ManyToOne(() => Event, (event) => event.participations)
  event: Event;
}
