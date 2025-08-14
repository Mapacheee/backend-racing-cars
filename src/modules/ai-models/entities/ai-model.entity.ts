import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Player } from '../../players/entities/player.entity';

@Entity('ai_models')
export class AIModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  version: string;

  @Column('simple-json')
  modelData: Record<string, any>;

  @Column('simple-json', { nullable: true })
  configuration: Record<string, any>;

  @Column('int', { default: 1 })
  generationNumber: number;

  @Column('simple-json', { nullable: true })
  trainingMetrics: {
    distanceCompleted: number;
    timeElapsed: number;
    avgSpeed: number;
    collisions: number;
    lapTimes?: number[];
  };

  @Column('simple-json', { nullable: true })
  genetics: {
    parentIds?: string[];
    fitnessScore: number;
    mutationRate?: number;
  };

  @Column({ nullable: true })
  lastTrainingDate: Date;

  @Column('boolean', { default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Player, (user) => user.aiModels)
  @JoinColumn({ name: 'userId' })
  player: Player;

  @Column()
  playerId: string;
}
