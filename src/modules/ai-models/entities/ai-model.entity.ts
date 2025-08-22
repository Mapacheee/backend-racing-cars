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

export interface NetworkMetadata {
  nodes?: number;
  connections?: number;
  species?: number;
  isElite?: boolean;
}

export interface NEATConfig {
  populationSize: number;
  mutationRate: number;
  elitism: number;
  inputNodes: number;
  outputNodes: number;
}

interface Node {
  bias: number;
  type: string;
}

@Entity('ai_models')
export class AIModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  playerId: string;

  @Column('int')
  generationNumber: number;

  @Column('int')
  networkIndex: number;

  @Column('json')
  networkData: any;

  @Column('float', { default: 0 })
  fitness: number;

  @Column('json', { nullable: true })
  metadata: NetworkMetadata;

  @Column('json')
  neatConfig: NEATConfig;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Player, (player) => player.aiModels)
  @JoinColumn({ name: 'playerId' })
  player: Player;
}
