import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Track } from '../../tracks/entities/track.entity';
import { RaceParticipant } from './race-participant.entity';

export enum RaceStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('races')
export class Race {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Track)
  @JoinColumn({ name: 'trackId' })
  track: Track;

  @Column()
  trackId: string;

  @Column('simple-json', { nullable: true })
  configuration: Record<string, any>;

  @Column({
    type: 'varchar',
    enum: RaceStatus,
    default: RaceStatus.PENDING,
  })
  status: RaceStatus;

  @Column({ type: 'datetime', nullable: true })
  startTime: Date;

  @Column({ type: 'datetime', nullable: true })
  endTime: Date;

  @OneToMany(() => RaceParticipant, (participant) => participant.race)
  participants: RaceParticipant[];

  @CreateDateColumn()
  createdAt: Date;
}
