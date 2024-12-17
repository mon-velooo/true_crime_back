import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Crime {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "date" })
  start_date: string;

  @Column({ type: "time", precision: 0 })
  start_time: string;

  @Column({ type: "date" })
  end_date: string;

  @Column({ type: "time", precision: 0 })
  end_time: string;

  @Column({ type: "double precision" })
  latitude: number;

  @Column({ type: "double precision" })
  longitude: number;

  @Column({ type: "text" })
  description: string;
}
