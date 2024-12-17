import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { GenderEnum } from "../enums/GenderEnum";
import { Country } from "./Country";
import { AthleteSport } from "./AtheleteSport";
import { Participation } from "./Participation";
import { Like } from "./Like";

@Entity()
export class Athlete {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: "varchar", length: 100 })
  firstname: string;

  @Column({ type: "varchar", length: 100 })
  lastname: string;

  @Column({ type: "enum", enum: GenderEnum })
  gender: GenderEnum;

  @Column({ type: "int" })
  age: number;

  @Column({ type: "int" })
  height: number;

  @Column({ type: "int" })
  weight: number;

  @Column({ type: "varchar", length: 500, nullable: true })
  pictureProfile: string;

  @ManyToOne(() => Country, (country) => country.atheles)
  country: Country;

  @OneToMany(() => AthleteSport, (athleteSport) => athleteSport.athlete, {})
  athleteSports: AthleteSport[];

  @OneToMany(() => Participation, (participation) => participation.athlete)
  participations: Participation[];

  @OneToMany(() => Like, (like) => like.athlete)
  likes: Like[];
}
