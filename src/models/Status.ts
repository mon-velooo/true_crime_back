import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Status {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100, unique: true })
  label: string;
}
