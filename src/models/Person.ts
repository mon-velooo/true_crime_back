import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AgeGroup } from "./AgeGroup";
import { Gender } from "./Gender";
import { Crime } from "./Crime";

@Entity()
export class Person {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => AgeGroup, (ageGroup) => ageGroup.id)
  age_group: AgeGroup;

  @ManyToOne(() => Gender, (gender) => gender.id)
  gender: Gender;

  @OneToMany(() => Crime, (crime) => crime.id, {})
  crimes: Crime[];
}
