import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('race_statistics')
export class RaceStatistics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  raceDate: Date;

  @Column('json')
  participants: {
    aiModelId: string;
    position: number;
    finishTime?: number;
    distanceCompleted: number;
    lapTimes: number[];
  }[];

  @Column('json')
  trackInfo: {
    trackId: string;
    trackName: string;
    numberOfLaps: number;
  };

  @Column('json', { nullable: true })
  raceConditions: {
    weather?: string;
    difficulty?: string;
    numberOfParticipants: number;
  };

  @Column('json', { nullable: true })
  raceMetrics: {
    averageSpeed: number;
    bestLapTime: number;
    totalRaceTime: number;
    collisions: number;
  };
}
