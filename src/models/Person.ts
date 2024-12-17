import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AgeGroup } from "./AgeGroup";
import { Gender } from "./Gender";

@Entity()
export class Person {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => AgeGroup, (ageGroup) => ageGroup.id)
  age_group: AgeGroup;

  @ManyToOne(() => Gender, (gender) => gender.id)
  gender: Gender;
}
