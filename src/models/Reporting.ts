import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Reporting {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "double precision" })
  latitude: number;

  @Column({ type: "double precision" })
  longitude: number;

  @Column({
    type: "geography",
    nullable: false,
    spatialFeatureType: "Point",
    srid: 4326,
  })
  location: string;

  @Column({ type: "text" })
  description: string;
}
