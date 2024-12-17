import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class LocationDescription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100, unique: true })
  description: string;
}
