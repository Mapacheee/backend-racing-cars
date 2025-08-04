import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Race } from './race.entity';
import { AIModel } from '../../ai-models/entities/ai-model.entity';

@Entity('race_participants')
export class RaceParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Race, (race) => race.participants)
  @JoinColumn({ name: 'raceId' })
  race: Race;

  @Column()
  raceId: string;

  @ManyToOne(() => AIModel)
  @JoinColumn({ name: 'aiModelId' })
  aiModel: AIModel;

  @Column()
  aiModelId: string;

  @Column({ nullable: true })
  position: number;

  @Column('float', { nullable: true })
  finishingTime: number;

  @Column('simple-json', { nullable: true })
  performanceMetrics: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
