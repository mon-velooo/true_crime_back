import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Person } from "./Person";
import { Crime } from "./Crime";

@Entity()
export class Offence {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 10, unique: true })
  code: string;

  @Column({ type: "varchar", length: 255 })
  description: string;

  @OneToMany(() => Crime, (crime) => crime.id, {})
  crimes: Crime[];
}
