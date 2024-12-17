import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Athlete } from "./Athlete";

@Entity()
export class Like {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @ManyToOne(() => Athlete, (athlete) => athlete.likes)
  athlete: Athlete;
}
