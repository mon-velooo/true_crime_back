import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { GenderEnum } from "../enums/GenderEnum";
import { SportField } from "./SportField";
import { AthleteSport } from "./AtheleteSport";
import { Event } from "./Event";

@Entity()
export class Sport {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: "varchar", length: 100, unique: true })
  label: string;

  @Column({ type: "enum", enum: GenderEnum })
  gender: GenderEnum;

  @Column({ type: "boolean", default: false })
  isTeam: boolean;

  @ManyToOne(() => SportField, (sportField) => sportField.sports)
  sportField: SportField;

  @OneToMany(() => AthleteSport, (athleteSport) => athleteSport.sport)
  athleteSports: AthleteSport[];

  @OneToMany(() => Event, (event) => event.sport)
  events: Event[];
}
