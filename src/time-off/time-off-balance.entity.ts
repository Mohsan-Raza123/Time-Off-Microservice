// File: src/time-off/time-off-balance.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['employeeId', 'locationId']) // Yeh ensure karega ke ek location par ek employee ka ek hi balance record ho
export class TimeOffBalance {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  employeeId!: string;

  @Column()
  locationId!: string;

  @Column('float')
  balance!: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  lastSyncedAt!: Date;
}