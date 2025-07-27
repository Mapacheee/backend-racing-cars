import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

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

  @Column({ nullable: true })
  trainingStats: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.aiModels)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;
}
