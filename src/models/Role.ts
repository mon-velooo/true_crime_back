import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { RoleEnum } from "../enums/RoleEnum";

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: RoleEnum })
  label: RoleEnum;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
