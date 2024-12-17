import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MedalEnum } from "../enums/MedalEnum";
import { AthleteSport } from "./AtheleteSport";

@Entity()
export class Medal {
  @PrimaryGeneratedColumn()
  type: number;

  @Column({ type: "enum", enum: MedalEnum })
  label: MedalEnum;

  @OneToMany(() => AthleteSport, (athleteSport) => athleteSport.medalType)
  athleteSports: AthleteSport[];
}
