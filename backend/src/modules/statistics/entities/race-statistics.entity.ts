import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('race_statistics')
export class RaceStatistics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  raceDate: Date;

  @Column('simple-json')
  participants: {
    aiModelId: string;
    position: number;
    finishTime?: number;
    distanceCompleted: number;
    lapTimes: number[];
  }[];

  @Column('simple-json')
  trackInfo: {
    trackId: string;
    trackName: string;
    numberOfLaps: number;
  };

  @Column('simple-json', { nullable: true })
  raceConditions: {
    weather?: string;
    difficulty?: string;
    numberOfParticipants: number;
  };

  @Column('simple-json', { nullable: true })
  raceMetrics: {
    averageSpeed: number;
    bestLapTime: number;
    totalRaceTime: number;
    collisions: number;
  };
}
