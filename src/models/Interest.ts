import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { SportField } from "./SportField";

@Entity()
export class Interest {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => SportField, (sportField) => sportField.interests)
  sportField: SportField;
}
