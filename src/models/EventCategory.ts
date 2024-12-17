import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { EventCategoryEnum } from "../enums/EventCategoryEnum";
import { Event } from "./Event";

@Entity()
export class EventCategory {
  @PrimaryGeneratedColumn()
  category: number;

  @Column({ type: "enum", enum: EventCategoryEnum })
  label: EventCategoryEnum;

  @OneToMany(() => Event, (event) => event.typeEvent)
  events: Event[];
}
