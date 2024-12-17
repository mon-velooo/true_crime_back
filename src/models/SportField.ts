import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Sport } from "./Sport";
import { Interest } from "./Interest";
import { SportFieldEnum } from "../enums/SportFieldEnum";

@Entity()
export class SportField {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: "enum", enum: SportFieldEnum })
  label: SportFieldEnum;

  @OneToMany(() => Sport, (sport) => sport.sportField)
  sports: Sport[];

  @OneToMany(() => Interest, (interest) => interest.sportField)
  interests: Interest[];
}
