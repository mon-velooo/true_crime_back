import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Crime } from "./Crime";

@Entity()
export class LawCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255, unique: true })
  label: string;

  @OneToMany(() => Crime, (crime) => crime.id, {})
  crimes: Crime[];
}
