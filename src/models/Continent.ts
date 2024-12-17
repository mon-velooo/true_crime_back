import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Country } from "./Country";

@Entity()
export class Continent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 80, unique: true })
  name: string;

  @OneToMany(() => Country, (country) => country.continent)
  countries: Country[];
}
