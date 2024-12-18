import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { District } from "./District";
import { LocationDescription } from "./LocationDescription";
import { LocationType } from "./LocationType";
import { Person } from "./Person";
import { Status } from "./Status";
import { LawCategory } from "./LawCategory";
import { Offence } from "./Offence";

@Entity()
export class Crime {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "date" })
  start_date: string;

  @Column({ type: "time", precision: 0 })
  start_time: string;

  @Column({ type: "date", nullable: true })
  end_date: string;

  @Column({ type: "time", precision: 0, nullable: true })
  end_time: string;

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

  @ManyToOne(() => District, (district) => district.id, { nullable: true })
  district: District;

  @ManyToOne(
    () => LocationDescription,
    (locationDescription) => locationDescription.id,
    { nullable: true }
  )
  locationDescription: LocationDescription;

  @ManyToOne(() => LocationType, (locationType) => locationType.id, {
    nullable: true,
  })
  locationType: LocationType;

  @ManyToOne(() => Person, (person) => person.id)
  suspectPerson: Person;

  @ManyToOne(() => Person, (person) => person.id)
  victimPerson: Person;

  @ManyToOne(() => Status, (status) => status.id)
  status: Status;

  @ManyToOne(() => LawCategory, (lawCategory) => lawCategory.id)
  lawCategory: LawCategory;

  @ManyToOne(() => Offence, (offence) => offence.id)
  offence: Offence;
}
