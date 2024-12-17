import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Person } from "./Person";

@Entity()
export class Gender {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 3, unique: true })
  label: string;

  @OneToMany(() => Person, (person) => person.id, {})
  persons: Person[];
}
