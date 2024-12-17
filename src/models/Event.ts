import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Sport } from "./Sport";
import { EventCategory } from "./EventCategory";
import { Participation } from "./Participation";

@Entity()
export class Event {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "date" })
  startDate: Date;

  @Column({ type: "date" })
  endDate: Date;

  @Column({ type: "varchar", length: 50 })
  latitude: string;

  @Column({ type: "varchar", length: 50 })
  longitude: string;

  @Column({ type: "varchar" })
  location: string;

  @Column({ type: "varchar", length: 1000 })
  description: string;

  @ManyToOne(() => EventCategory, (eventCategory) => eventCategory.events)
  typeEvent: EventCategory;

  @ManyToOne(() => Sport, (sport) => sport.events, { nullable: true })
  sport: Sport;

  @OneToMany(() => Participation, (participation) => participation.event)
  participations: Participation[];
}
