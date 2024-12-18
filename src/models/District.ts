import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Crime } from "./Crime";

@Entity()
export class District {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255, unique: true })
  name: string;

  // Correction ici : la relation doit pointer sur 'district' dans Crime
  @OneToMany(() => Crime, (crime) => crime.district, { cascade: true })
  crimes: Crime[];
}
