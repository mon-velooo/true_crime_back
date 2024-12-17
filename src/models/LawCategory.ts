import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class LawCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255, unique: true })
  label: string;
}
