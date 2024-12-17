import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Crime } from "./Crime";

@Entity()
export class Status {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100, unique: true })
  label: string;

  @OneToMany(() => Crime, (crime) => crime.id, {})
  crimes: Crime[];
}
