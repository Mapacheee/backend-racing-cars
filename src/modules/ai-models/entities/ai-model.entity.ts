import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Player } from '../../players/entities/player.entity';
import { Genome, NEATConfig } from '../interfaces/ai-model.interface';

@Entity('ai_models')
export class AIModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('json')
  neatGenomes: Genome[];

  @Column('int', { default: 1 })
  generationNumber: number;

  @Column('json')
  config: NEATConfig;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Player, (player) => player.aiModels)
  @JoinColumn({ name: 'playerId' })
  player: Player;

  @Column()
  playerId: string;
}
