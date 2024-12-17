import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class LocationType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100, unique: true })
  label: string;

  @OneToMany(() => Crime, (crime) => crime.id, {})
  crimes: Crime[];
}
