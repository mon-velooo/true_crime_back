import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Person } from "./Person";

@Entity()
export class AgeGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 20, unique: true })
  range: string;

  @OneToMany(() => Person, (person) => person.id, {})
  persons: Person[];
}
