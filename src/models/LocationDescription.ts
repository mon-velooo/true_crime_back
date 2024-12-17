import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Crime } from "./Crime";

@Entity()
export class LocationDescription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100, unique: true })
  description: string;

  @OneToMany(() => Crime, (crime) => crime.id, {})
  crimes: Crime[];
}
